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
  const { name, owner, filepath, ref }: GitUrl = gitUrlParse(url);

  const contentsRes = await fetch(
    `https://api.github.com/repos/${owner}/${name}/contents/${filepath}?ref=${ref}`,
  );

  const contents = await contentsRes.json();

  if (!Array.isArray(contents)) {
    throw new Error(`This url seems not a directory. "${url}"`);
  }

  const directory: string = targetDirectory
    ? path.resolve(cwd, targetDirectory)
    : path.resolve(cwd, path.basename(filepath));

  await fs.mkdirpSync(directory);

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
