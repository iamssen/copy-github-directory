import gitUrlParse, { GitUrl } from 'git-url-parse';

describe('git-url-parse', () => {
  test('should parse the tree type url', async () => {
    const url: GitUrl = gitUrlParse(
      'https://github.com/rocket-hangar/rocket-punch-workspace-example/tree/master/samples/web',
    );

    expect(url).toMatchObject<Partial<GitUrl>>({
      owner: 'rocket-hangar',
      name: 'rocket-punch-workspace-example',
      ref: 'master',
      filepath: 'samples/web',
      filepathtype: 'tree',
    });

    const res = await fetch(
      // https://api.github.com/repos/{owner}/{name}/contents/{filepath}?ref={ref}
      `https://api.github.com/repos/${url.owner}/${url.name}/contents/${url.filepath}?ref=${url.ref}`,
    );

    const json = await res.json();

    if (res.status < 299) {
      expect(Array.isArray(json)).toBeTruthy();
    } else {
      console.error(json);
    }
  });

  test('should parse the root url', async () => {
    const url: GitUrl = gitUrlParse('https://github.com/rocket-hangar/rocket-punch-workspace-example');

    expect(url).toMatchObject<Partial<GitUrl>>({
      owner: 'rocket-hangar',
      name: 'rocket-punch-workspace-example',
      ref: '',
      filepath: '',
      filepathtype: '',
    });
  });
});
