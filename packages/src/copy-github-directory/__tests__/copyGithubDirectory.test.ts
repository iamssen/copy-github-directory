import { createTmpDirectory } from '@ssen/tmp-directory';
import { copyGithubDirectory } from 'copy-github-directory';
import fs from 'fs-extra';
import path from 'path';
import { describe, expect, test } from 'vitest';

describe('copyGithubDirectory', () => {
  function assertWorkspaceTemplateHasFiles(directory: string) {
    expect(fs.existsSync(path.join(directory, 'package.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(directory, 'yarn.lock'))).toBeTruthy();
    expect(fs.existsSync(path.join(directory, '.github'))).toBeTruthy();
    expect(
      fs.statSync(path.join(directory, '.github/workflows')).isDirectory(),
    ).toBeTruthy();
  }

  function assertWebTemplateHasFiles(directory: string) {
    expect(fs.existsSync(path.join(directory, 'package.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(directory, 'tsconfig.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(directory, 'src'))).toBeTruthy();
    expect(fs.statSync(path.join(directory, 'src')).isDirectory()).toBeTruthy();
  }

  test('should generate the files to a directory by root type url', async () => {
    // Arrange
    const cwd: string = await createTmpDirectory();

    // Act
    await copyGithubDirectory({
      cwd,
      url: 'https://github.com/rocket-hangar/workspace-template',
    });

    // Assert
    const targetDirectory: string = path.join(cwd, 'workspace-template');
    assertWorkspaceTemplateHasFiles(targetDirectory);
  });

  test('should generate the files to a directory what is named by basename of url', async () => {
    // Arrange
    const cwd: string = await createTmpDirectory();

    // Act
    await copyGithubDirectory({
      cwd,
      url: 'https://github.com/rocket-hangar/templates/tree/main/web',
    });

    // Assert
    const targetDirectory: string = path.join(cwd, 'web');
    assertWebTemplateHasFiles(targetDirectory);
  });

  test('should generate the files to current directory', async () => {
    // Arrange
    const targetDirectory: string = await createTmpDirectory();

    // Act
    await copyGithubDirectory({
      cwd: targetDirectory,
      targetDirectory: '.',
      url: 'https://github.com/rocket-hangar/templates/tree/main/web',
    });

    // Assert
    assertWebTemplateHasFiles(targetDirectory);
  });

  test('should generate the files to multiple directory', async () => {
    // Arrange
    const targetDirectory: string = await createTmpDirectory();

    // Act
    await copyGithubDirectory({
      cwd: targetDirectory,
      targetDirectory: 'a/b/c',
      url: 'https://github.com/rocket-hangar/templates/tree/main/web',
    });

    // Assert
    assertWebTemplateHasFiles(path.join(targetDirectory, 'a/b/c'));
  });

  test('should generate the files to the specific directory', async () => {
    // Arrange
    const targetDirectory: string = await createTmpDirectory();

    // Act
    await copyGithubDirectory({
      targetDirectory,
      url: 'https://github.com/rocket-hangar/templates/tree/main/web',
    });

    // Assert
    assertWebTemplateHasFiles(targetDirectory);
  });

  test('should compose a workspaces', async () => {
    // Arrange
    const cwd: string = await createTmpDirectory();
    const workspacesName: string = 'workspaces';
    const projectName: string = 'project';

    // Act
    await copyGithubDirectory({
      cwd,
      targetDirectory: workspacesName,
      url: 'https://github.com/rocket-hangar/workspace-template',
    });

    // Assert
    const workspacesDirectory: string = path.join(cwd, workspacesName);
    assertWorkspaceTemplateHasFiles(workspacesDirectory);

    // Act
    await copyGithubDirectory({
      cwd: workspacesDirectory,
      targetDirectory: projectName,
      url: 'https://github.com/rocket-hangar/templates/tree/main/web',
    });

    // Assert
    const projectDirectory: string = path.join(
      workspacesDirectory,
      projectName,
    );
    assertWebTemplateHasFiles(projectDirectory);

    const { workspaces } = await fs.readJsonSync(
      path.join(workspacesDirectory, 'package.json'),
    );
    const { name } = await fs.readJsonSync(
      path.join(projectDirectory, 'package.json'),
    );

    expect(workspaces).toMatchObject([projectName]);
    expect(name).toBe(projectName);
  }, 15000);

  test('should use alias from user config', async () => {
    // Arrange
    const configDirectory: string = await createTmpDirectory();
    const targetDirectory: string = await createTmpDirectory();
    const configFile: string = path.join(configDirectory, '.ghcopy.json');

    await fs.writeJson(configFile, {
      alias: {
        web: 'https://github.com/rocket-hangar/templates/tree/main/web',
      },
    });

    process.env.GHDIR_CONFIG = configFile;

    // Act
    await copyGithubDirectory({
      targetDirectory,
      url: 'web',
    });

    // Assert
    assertWebTemplateHasFiles(targetDirectory);

    // Clean
    process.env.GHDIR_CONFIG = undefined;
  });

  test('should throw error if url is a file', async () => {
    // Arrange
    const cwd: string = await createTmpDirectory();

    // Act
    await expect(
      copyGithubDirectory({
        cwd,
        url: 'https://github.com/rocket-hangar/templates/tree/main/web/package.json',
      }),
    ).rejects.toThrow();
  });

  test('should allow whitelist directory', async () => {
    // Arrange
    const targetDirectory: string = await createTmpDirectory();

    fs.mkdirpSync(path.join(targetDirectory, '.git'));

    // Act
    await copyGithubDirectory({
      targetDirectory,
      url: 'https://github.com/rocket-hangar/templates/tree/main/web',
    });

    // Assert
    assertWebTemplateHasFiles(targetDirectory);
  });

  test('should throw error if target directory is not empty', async () => {
    // Arrange
    const targetDirectory: string = await createTmpDirectory();

    fs.writeJsonSync(path.join(targetDirectory, 'hello.json'), { foo: 'bar' });

    // Act
    await expect(
      copyGithubDirectory({
        targetDirectory,
        url: 'https://github.com/rocket-hangar/templates/tree/main/web',
      }),
    ).rejects.toThrow();
  });
});
