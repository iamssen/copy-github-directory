import gitUrlParse, { GitUrl } from 'git-url-parse';

describe('git-url-parse', () => {
  test('should get directories', async () => {
    const url: GitUrl = gitUrlParse(
      'https://github.com/rocket-hangar/rocket-punch-workspace-example/tree/master/samples/web',
    );

    expect(url).toMatchObject<Partial<GitUrl>>({
      owner: 'rocket-hangar',
      name: 'rocket-punch-workspace-example',
      ref: 'master',
      filepath: 'samples/web',
    });

    const res = await fetch(
      // https://api.github.com/repos/{owner}/{name}/contents/{filepath}?ref={ref}
      `https://api.github.com/repos/${url.owner}/${url.name}/contents/${url.filepath}?ref=${url.ref}`,
    );

    const json = await res.json();

    expect(Array.isArray(json)).toBeTruthy();
  });
});
