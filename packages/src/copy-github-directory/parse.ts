import gitUrlParse, { GitUrl } from 'git-url-parse';
import fetch, { HeadersInit } from 'node-fetch';

type Branches = Array<{ name: string }>;

export async function parse(
  url: string,
  headers?: HeadersInit,
): Promise<GitUrl> {
  const { owner, name, ref, filepath, ...parsed }: GitUrl = gitUrlParse(url);

  const branches: Branches = await fetch(
    `https://api.github.com/repos/${owner}/${name}/branches`,
    { headers },
  ).then((res) => res.json());

  if (!branches.some((branch) => branch.name === name)) {
    const refPath = `${ref}/${filepath}`;
    const exactBranch = branches.find(
      (branch) => refPath.indexOf(branch.name) === 0,
    );

    if (exactBranch) {
      const exactFilepath = refPath.slice(exactBranch.name.length + 1);

      return {
        owner,
        name,
        ref: exactBranch.name,
        filepath: exactFilepath,
        ...parsed,
      };
    }
  }

  return {
    owner,
    name,
    ref,
    filepath,
    ...parsed,
  };
}
