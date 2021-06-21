import fs from 'fs-extra';
import gitUrlParse, { GitUrl } from 'git-url-parse';
import got from 'got';
import fetch, { HeadersInit } from 'node-fetch';
import os from 'os';
import * as path from 'path';
import { Stream } from 'stream';
import tar from 'tar';
import { promisify } from 'util';
import { preConfiguredAlias } from './env';

const pipeline = promisify(Stream.pipeline);

export interface CopyGithubDirectoryParams {
  /**
   * github url
   *
   * @example https://github.com/rocket-hangar/workspace-template
   * @example https://github.com/rocket-hangar/workspace-template/tree/master/samples/web
   */
  readonly url: string;

  /**
   * directory path to make
   *
   * @default https://github.com/rocket-hangar/workspace-template > workspace-template
   * @default https://github.com/rocket-hangar/workspace-template/tree/master/samples/web > web
   *
   * @example directory
   * @example path/directory
   * @example /absolute/path/directory
   * @example .
   */
  readonly targetDirectory?: string;

  readonly cwd?: string;

  /**
   * github token
   *
   * @see https://github.com/settings/tokens/new create new github token
   *
   * @default process.env.GITHUB_TOKEN
   */
  readonly githubToken?: string;

  /**
   * process workspaces config
   *
   * if `.yarn.lock` file is exists in `cwd` and
   * `workspaces` property is exists on `<cwd>/package.json`.
   *
   * it will add the target directory name to `workspaces` property.
   *
   * @default true
   */
  readonly workspace?: boolean;
}

export interface UserConfig {
  alias?: Record<string, string>;
}

function whitelist(file: string): boolean {
  if (file === '.git') {
    return false;
  }
  return true;
}

export async function copyGithubDirectory({
  url: _url,
  targetDirectory,
  cwd = process.cwd(),
  githubToken = process.env.GITHUB_TOKEN,
  workspace = true,
}: CopyGithubDirectoryParams): Promise<string> {
  // ---------------------------------------------
  // copy process
  // ---------------------------------------------
  // read user config
  const configFile =
    process.env.GHDIR_CONFIG ?? path.join(os.homedir(), '.ghcopy.json');

  const { alias: _alias }: UserConfig = fs.existsSync(configFile)
    ? fs.readJsonSync(configFile)
    : {};

  const alias: Record<string, string> = {
    ...preConfiguredAlias,
    ..._alias,
  };

  const url: string = alias?.[_url] ?? _url;

  // parse github url
  const {
    name, // repository name
    owner, // repository owner id
    filepath, // file location
    filepathtype, // 'blob' | 'tree' | ''
    ref: _ref, // master, develop, <sha>...
  }: GitUrl = gitUrlParse(url);

  // http request headers
  const headers: HeadersInit | undefined =
    typeof githubToken === 'string'
      ? { Authorization: `token ${githubToken}` }
      : undefined;

  // target ref = master, develop, <sha>...
  const ref: string =
    _ref.length > 0
      ? _ref
      : await fetch(`https://api.github.com/repos/${owner}/${name}`, {
          headers,
        })
          .then((res) => res.json())
          .then(({ default_branch }) => default_branch);

  // is filepath a directory
  const isDirectory: boolean =
    filepathtype === ''
      ? true
      : await fetch(
          `https://api.github.com/repos/${owner}/${name}/contents/${filepath}?ref=${ref}`,
          {
            headers,
          },
        )
          .then((res) => res.json())
          .then((contents) => Array.isArray(contents));

  if (!isDirectory) {
    throw new Error(`This url seems not a directory. "${url}"`);
  }

  // absolute path
  let directory: string;

  if (targetDirectory === '.') {
    directory = cwd; // <cwd>
  } else {
    directory = targetDirectory
      ? path.resolve(cwd, targetDirectory) // <cwd>/<targetDirectory> user specific directory
      : filepath === ''
      ? path.resolve(cwd, name) // <cwd>/<repo> is root type url
      : path.resolve(cwd, path.basename(filepath)); // <cwd>/<dirname> is tree type url

    await fs.mkdirpSync(directory);
  }

  if (fs.readdirSync(directory).filter(whitelist).length > 0) {
    throw new Error(`directory is not empty. "${directory}"`);
  }

  // download
  await pipeline(
    // download github tar.gz
    got.stream(`https://codeload.github.com/${owner}/${name}/tar.gz/${ref}`),
    // extract tar.gz to directory
    tar.extract(
      { cwd: directory, strip: filepath ? filepath.split('/').length + 1 : 1 },
      [`${name}-${ref}${filepath ? `/${filepath}` : ''}`],
    ),
  );

  // ---------------------------------------------
  // post copy process
  // ---------------------------------------------
  // add directory to workspaces
  const cwdPackageJson: string = path.resolve(cwd, 'package.json');
  const directoryPackageJson: string = path.resolve(directory, 'package.json');

  if (
    // if user try to compose workspaces (default = true)
    workspace &&
    // and <directory>/package.json is inside of <cwd>/package.json
    directoryPackageJson.indexOf(cwdPackageJson) &&
    // and there exists yarn.lock and <cwd>/package.json
    fs.existsSync(path.resolve(cwd, 'yarn.lock')) &&
    fs.existsSync(cwdPackageJson) &&
    // and there exists <directory>/package.json
    fs.existsSync(directoryPackageJson)
  ) {
    // read <cwd>/package.json
    const cwdPackageJsonContents = await fs.readJson(cwdPackageJson);

    const workspaces = Array.isArray(cwdPackageJsonContents.workspaces)
      ? cwdPackageJsonContents.workspaces
      : [];

    const workspaceName: string = path.basename(directory);

    // read <directory>/package.json
    const directoryPackageJsonContents = await fs.readJson(
      directoryPackageJson,
    );

    // add workspaceName to <cwd>/package.json/[workspaces]
    cwdPackageJsonContents.workspaces = [
      ...workspaces,
      path.relative(cwd, directory),
    ];

    // change name of <directory>/package.json
    directoryPackageJsonContents.name = workspaceName;

    // update package.json files
    await Promise.all([
      fs.writeJson(cwdPackageJson, cwdPackageJsonContents, { spaces: 2 }),
      fs.writeJson(directoryPackageJson, directoryPackageJsonContents, {
        spaces: 2,
      }),
    ]);
  }

  return directory;
}
