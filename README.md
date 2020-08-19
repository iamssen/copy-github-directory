# `generate-github-directory`

![CI](https://github.com/rocket-hangar/generate-github-directory/workflows/Test/badge.svg)
[![codecov](https://codecov.io/gh/rocket-hangar/generate-github-directory/branch/master/graph/badge.svg)](https://codecov.io/gh/rocket-hangar/generate-github-directory)

```sh
npx generate-github-directory https://github.com/rocket-hangar/rocket-punch-workspace-example/tree/master/samples/web

# cd web
# npm install
```

or 

```sh
npx generate-github-directory https://github.com/rocket-hangar/rocket-punch-workspace-example/tree/master/samples/web my-project

# cd my-project
# npm install
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