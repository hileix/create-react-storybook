'use strict';
const chalk = require('chalk');
const fs = require('fs-extra');
const validateProjectName = require('validate-npm-package-name');
const commander = require('commander');
const envinfo = require('envinfo');

const packageJson = require('../package.json');

const commandName = 'crs';

let projectName;
const program = new commander.Command(commandName)
  .version(packageJson.version)
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action(name => {
    projectName = name;
  })
  .option('--verbose', 'print additional logs')
  .option('--info', 'print environment debug info')
  .allowUnknownOption()
  .on('--help', () => {
    console.log(`    Only ${chalk.green('<project-directory>')} is required.`);
  })
  .parse(process.argv);

if (program.info) {
  console.log(chalk.bold('\nEnvironment Info:'));
  return envinfo
    .run(
      {
        System: ['OS', 'CPU'],
        Binaries: ['Node', 'npm', 'Yarn'],
        Browsers: ['Chrome', 'Edge', 'Internet Explorer', 'Firefox', 'Safari']
      },
      {
        duplicates: true,
        showNotFound: true
      }
    )
    .then(console.log);
}

if (typeof projectName === 'undefined') {
  console.error('Please specify the project directory:');
  console.log(
    `  ${chalk.cyan(commandName)} ${chalk.green('<project-directory>')}`
  );
  console.log();
  console.log('For example:');
  console.log(`  ${chalk.cyan(commandName)} ${chalk.green('my-react-app')}`);
  console.log();
  console.log(`Run ${chalk.cyan(`${commandName} --help`)} to see all options.`);
  process.exit(1);
}

create(projectName, program.verbose);

function create(projectName, verbose) {
  const root = path.resolve(name);
  const appName = path.basename(root);

  checkAppName(appName);
  fs.ensureDirSync(name);
  if (!isSafeToCreateProjectIn(root, name)) {
    process.exit(1);
  }
}
