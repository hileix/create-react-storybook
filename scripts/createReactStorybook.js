'use strict';
const chalk = require('chalk');
const fs = require('fs-extra');
const validateProjectName = require('validate-npm-package-name');
const commander = require('commander');
const envinfo = require('envinfo');
const path = require('path');
const jsonfile = require('jsonfile');
const spawn = require('cross-spawn');

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

function printValidationResults(results) {
  if (typeof results !== 'undefined') {
    results.forEach(error => {
      console.error(chalk.red(`  *  ${error}`));
    });
  }
}

function checkAppName(appName) {
  const validationResult = validateProjectName(appName);
  if (!validationResult.validForNewPackages) {
    console.error(
      `Could not create a project called ${chalk.red(
        `"${appName}"`
      )} because of npm naming restrictions:`
    );
    printValidationResults(validationResult.errors);
    printValidationResults(validationResult.warnings);
    process.exit(1);
  }

  // TODO: there should be a single place that holds the dependencies
  const dependencies = ['react', 'react-dom', 'react-scripts'].sort();
  if (dependencies.indexOf(appName) >= 0) {
    console.error(
      chalk.red(
        `We cannot create a project called ${chalk.green(
          appName
        )} because a dependency with the same name exists.\n` +
          `Due to the way npm works, the following names are not allowed:\n\n`
      ) +
        chalk.cyan(dependencies.map(depName => `  ${depName}`).join('\n')) +
        chalk.red('\n\nPlease choose a different project name.')
    );
    process.exit(1);
  }
}

create(projectName, program.verbose);

function create(name, verbose) {
  const destDirPath = path.resolve(process.cwd(), name);

  const dirPath = path.resolve(__dirname, '..', 'template');

  checkAppName(name);

  // copy files
  fs.copySync(dirPath, destDirPath);

  const packageJsonFile = path.resolve(destDirPath, 'package.json');

  const packageJsonFileContent = jsonfile.readFileSync(packageJsonFile);

  packageJsonFileContent.name = name;

  jsonfile.writeFileSync(packageJsonFile, packageJsonFileContent, {
    spaces: 2
  });

  // install
  spawn.sync('yarn', [], {
    cwd: path.resolve(destDirPath),
    stdio: 'inherit'
  });
}
