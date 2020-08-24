import fs from 'fs-extra';
import gitUrlParse, { GitUrl } from 'git-url-parse';
import got from 'got';
import fetch from 'node-fetch';
import * as path from 'path';
import { Stream } from 'stream';
import tar from 'tar';
import { promisify } from 'util';

const pipeline = promisify(Stream.pipeline);

export interface GenerateGithubDirectoryParams {
  readonly url: string;
  readonly targetDirectory?: string;
  readonly cwd?: string;
}

export async function generateGithubDirectory({
  url,
  targetDirectory,
  cwd = process.cwd(),
}: GenerateGithubDirectoryParams): Promise<string> {
  const { name, owner, filepath, filepathtype, ref: _ref }: GitUrl = gitUrlParse(url);

  const ref: string =
    _ref.length > 0
      ? _ref
      : await fetch(`https://api.github.com/repos/${owner}/${name}`)
          .then((res) => res.json())
          .then(({ default_branch }) => default_branch);

  const isDirectory: boolean =
    filepathtype === ''
      ? true
      : await fetch(`https://api.github.com/repos/${owner}/${name}/contents/${filepath}?ref=${ref}`)
          .then((res) => res.json())
          .then((contents) => Array.isArray(contents));

  if (!isDirectory) {
    throw new Error(`This url seems not a directory. "${url}"`);
  }

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

  if (fs.readdirSync(directory).length > 0) {
    throw new Error(`directory is not empty. "${directory}"`);
  }

  await pipeline(
    got.stream(`https://codeload.github.com/${owner}/${name}/tar.gz/${ref}`),
    tar.extract({ cwd: directory, strip: filepath ? filepath.split('/').length + 1 : 1 }, [
      `${name}-${ref}${filepath ? `/${filepath}` : ''}`,
    ]),
  );

  return directory;
}
