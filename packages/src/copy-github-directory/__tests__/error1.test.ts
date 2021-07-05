import { createTmpDirectory } from '@ssen/tmp-directory';
import { copyGithubDirectory } from 'copy-github-directory';
import fs from 'fs';
import path from 'path';

test('error1', async () => {
  // Arrange
  const targetDirectory: string = await createTmpDirectory();

  // Act
  await copyGithubDirectory({
    targetDirectory,
    url: 'https://github.com/terra-money/wallet-provider/tree/feature/next-support/templates/next',
  });

  // Assert
  expect(
    fs.existsSync(path.join(targetDirectory, 'next-env.d.ts')),
  ).toBeTruthy();
  expect(
    fs.existsSync(path.join(targetDirectory, 'tsconfig.json')),
  ).toBeTruthy();
  expect(
    fs.existsSync(path.join(targetDirectory, 'pages/index.tsx')),
  ).toBeTruthy();
});
