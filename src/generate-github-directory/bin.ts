import path from 'path';
import yargs from 'yargs';
import { generateGithubDirectory, GenerateGithubDirectoryParams } from './index';

export async function run() {
  const {
    _: [url, targetDirectory],
    emit,
  } = yargs
    .usage('Usage: $0 <url> [targetDirectory]')
    .options({
      emit: {
        type: 'boolean',
        default: true,
        describe:
          'if you set this false it will only print options without run (e.g. --no-emit or --emit false)',
      },
    })
    .example(
      '$0 https://github.com/rocket-hangar/rocket-punch-workspace-example/tree/master/samples/web',
      'generate files to {cwd}/web',
    )
    .example(
      '$0 https://github.com/rocket-hangar/rocket-punch-workspace-example/tree/master/samples/web some-directory',
      'generate files to {cwd}/some-directory',
    )
    .wrap(null)
    .help('h')
    .alias('h', 'help')
    .showHelpOnFail(true)
    .epilog('🚀 Rocket!').argv;

  if (!url) {
    throw new Error(`Undefined <url>`);
  }

  const params: GenerateGithubDirectoryParams = {
    url,
    targetDirectory,
    cwd: process.cwd(),
  };

  if (!emit) {
    console.log(params);
  } else {
    const directory = await generateGithubDirectory(params);
    console.log(`👍 "${url}" ‣‣‣ "${path.relative(process.cwd(), directory)}"`);
  }
}
