# `generate-github-directory`

![CI](https://github.com/rocket-hangar/generate-github-directory/workflows/Test/badge.svg)
[![codecov](https://codecov.io/gh/rocket-hangar/generate-github-directory/branch/master/graph/badge.svg)](https://codecov.io/gh/rocket-hangar/generate-github-directory)

# How to use

```sh
npx generate-github-directory https://github.com/rocket-hangar/rocket-punch-workspace-example/tree/master/samples/web

# $PWD/web
```

or 

```sh
npx generate-github-directory https://github.com/rocket-hangar/rocket-punch-workspace-example/tree/master/samples/web .

# $PWD
```

or

```sh
npx generate-github-directory https://github.com/rocket-hangar/rocket-punch-workspace-example/tree/master/samples/web my-project

# $PWD/my-project
```

or

```js
const { generateGithubDirectory } = require('generate-github-directory');

const directory = await generateGithubDirectory({
  url: 'https://github.com/rocket-hangar/rocket-punch-workspace-example/tree/master/samples/web',
  // targetDirectory: 'my-project',
  // targetDirectory: '/absolute/path/my-project',
});

console.log(directory);
```

# Tested URL types

- Root `https://github.com/rocket-hangar/rocket-punch-workspace-example`
  - default directory name: `rocket-punch-workspace-example` 
- Tree `https://github.com/rocket-hangar/rocket-punch-workspace-example/tree/master/samples/web`
  - default directory name: `web`

# Related Projects

- <https://github.com/rocket-hangar/rocket-punch>
- <https://github.com/rocket-hangar/rocket-scripts>
- <https://github.com/rocket-hangar/handbook>
- <https://github.com/rocket-hangar/generate-github-directory>