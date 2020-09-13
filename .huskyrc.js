function cp(from, to) {
  return [`cp ${from} ${to}`, `git add ${to}`];
}

function precommit(...workspaces) {
  return workspaces.map(
    (workspace) => `yarn workspace ${workspace} run precommit`,
  );
}

module.exports = {
  hooks: {
    'pre-commit': [
      `markdown-source-import README.md "packages/src/**/*.md" --git-add`,
      ...cp(`README.md`, `packages/src/generate-github-directory/README.md`),
      `lint-staged`,
      ...precommit(`packages`),
    ].join(' && '),
  },
};
