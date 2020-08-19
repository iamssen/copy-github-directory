import { createTmpDirectory } from '@ssen/tmp-directory';
import fs from 'fs-extra';
import { generateGithubDirectory } from 'generate-github-directory';
import path from 'path';

describe('generateGithubDirectory', () => {
  test('should generate the files to a directory by root type url', async () => {
    // Arrange
    const cwd: string = await createTmpDirectory();

    // Act
    await generateGithubDirectory({
      cwd,
      url: 'https://github.com/rocket-hangar/rocket-punch-workspace-example',
    });

    // Assert
    const targetDirectory: string = path.join(cwd, 'rocket-punch-workspace-example');

    expect(fs.existsSync(path.join(targetDirectory, 'package.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(targetDirectory, 'tsconfig.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(targetDirectory, 'samples'))).toBeTruthy();
    expect(fs.statSync(path.join(targetDirectory, 'samples/web')).isDirectory()).toBeTruthy();
  });

  test('should generate the files to a directory what is named by basename of url', async () => {
    // Arrange
    const cwd: string = await createTmpDirectory();

    // Act
    await generateGithubDirectory({
      cwd,
      url: 'https://github.com/rocket-hangar/rocket-punch-workspace-example/tree/master/samples/web',
    });

    // Assert
    const targetDirectory: string = path.join(cwd, 'web');

    expect(fs.existsSync(path.join(targetDirectory, 'package.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(targetDirectory, 'tsconfig.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(targetDirectory, 'src'))).toBeTruthy();
    expect(fs.statSync(path.join(targetDirectory, 'src')).isDirectory()).toBeTruthy();
  });

  test('should generate the files to the specific directory', async () => {
    // Arrange
    const targetDirectory: string = await createTmpDirectory();

    // Act
    await generateGithubDirectory({
      targetDirectory,
      url: 'https://github.com/rocket-hangar/rocket-punch-workspace-example/tree/master/samples/web',
    });

    // Assert
    expect(fs.existsSync(path.join(targetDirectory, 'package.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(targetDirectory, 'tsconfig.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(targetDirectory, 'src'))).toBeTruthy();
    expect(fs.statSync(path.join(targetDirectory, 'src')).isDirectory()).toBeTruthy();
  });

  test('should throw error if url is a file', async () => {
    // Arrange
    const cwd: string = await createTmpDirectory();

    // Act
    await expect(
      generateGithubDirectory({
        cwd,
        url:
          'https://github.com/rocket-hangar/rocket-punch-workspace-example/tree/master/samples/web/package.json',
      }),
    ).rejects.toThrow();
  });

  test('should throw error if target directory is not empty', async () => {
    // Arrange
    const targetDirectory: string = await createTmpDirectory();

    fs.writeJsonSync(path.join(targetDirectory, 'hello.json'), { foo: 'bar' });

    // Act
    await expect(
      generateGithubDirectory({
        targetDirectory,
        url: 'https://github.com/rocket-hangar/rocket-punch-workspace-example/tree/master/samples/web',
      }),
    ).rejects.toThrow();
  });
});
