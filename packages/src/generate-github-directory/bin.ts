import path from 'path';
import yargs from 'yargs';
import {
  generateGithubDirectory,
  GenerateGithubDirectoryParams,
} from './index';

export async function run() {
  const {
    _: [url, targetDirectory],
    emit,
    workspace,
  } = yargs
    .usage('Usage: $0 <url> [targetDirectory]')
    .options({
      emit: {
        type: 'boolean',
        default: true,
        describe: `if you set this false it will only print options without run (e.g. --no-emit or --emit false)`,
      },
      workspace: {
        type: 'boolean',
        default: true,
        describe: `if you don't want to compose workspaces set this false (e.g. --no-workspace or --workspace false)`,
      },
    })
    .example(
      '$0 https://github.com/rocket-hangar/rocket-scripts-templates/tree/master/templates/web',
      'generate files to $PWD/web',
    )
    .example(
      '$0 https://github.com/rocket-hangar/rocket-scripts-templates/tree/master/templates/web project',
      'generate files to $PWD/project',
    )
    .example(
      '$0 https://github.com/rocket-hangar/rocket-scripts-templates/tree/master/templates/web .',
      'generate files to $PWD',
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
    url: url.toString(),
    targetDirectory: targetDirectory.toString(),
    cwd: process.cwd(),
    workspace,
  };

  if (!emit) {
    console.log(params);
  } else {
    const directory = await generateGithubDirectory(params);
    console.log(`👍 "${url}" ‣‣‣ "${path.relative(process.cwd(), directory)}"`);
  }
}
