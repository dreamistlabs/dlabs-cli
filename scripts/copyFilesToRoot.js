/**
 * Whenever we update the boilerplate files in the /files folder, in an effort
 * to reduce the need to manually update those same files in the root of this
 * repository. This script will automate the process and copy over various
 * files that should adopt the changes made in the /files folder. For example,
 * if the .vscode configurations or .auto-changelog.json file changes, instead
 * of having to duplicate those changes to the same files in this project, the
 * script will copy it from the /files folder.
 *
 **/
let chalk = require('chalk');
//  import child_process from "child_process";
let fs = require('fs');
let fileExists = require('file-exists');
let inquirer = require('inquirer');
let shell = require('shelljs');

const scriptRunner = () => {
  const log = message => shell.echo(chalk.white(message));
  const delay = (seconds = 1) => shell.exec(`sleep ${seconds}`);

  // leverage a util file to share with ProjectCreator?
  const setPathLocation = () => {
    // TODO need better way to differentiate between macOS and Windows FILES_PATHs
    let dlabsLocation = shell.which('dlabs-cli').stdout.trim();

    if (dlabsLocation[0] === '/') {
      dlabsLocation = dlabsLocation.replace(/(\/\w+){1}$/, '');
      return `${dlabsLocation}/lib/node_modules/dlabs-cli`;
    } else if (dlabsLocation.includes('C:')) {
      dlabsLocation = dlabsLocation.replace(/\\DLABS-CLI.CMD/, '').replace(/\\\\/g, '\\');
      return `${dlabsLocation.toLowerCase()}\\node_modules\\dlabs-cli`;
    }
  };

  const FILES_PATH = `${setPathLocation()}/files`;

  console.log('bruhg');

  inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'forceUpdate',
        message:
          'Are you sure you want to forcifully update/replace the files in the current folder? This is irreversible.',
        default: false,
      },
    ])
    .then(userAnswer => {
      if (userAnswer.forceUpdate) {
        log('You chose not update your files. Starting process...');
        delay(2);

        const commonFiles = [`${FILES_PATH}/common/*`, `${FILES_PATH}/common/.*`];
        const qualityFiles = [`${FILES_PATH}/quality/.*`, `${FILES_PATH}/quality/*`];
        const cicdFiles = [`${FILES_PATH}/cicd/.*`];

        log('Copying common files...');
        delay(1);
        shell.cp('-R', commonFiles, '.');

        log('Copying quality files...');
        delay(1);
        shell.cp('-R', qualityFiles, '.');

        log('Copying CI/CD files...');
        delay(1);
        shell.cp('-R', cicdFiles, '.');
      } else {
        log('You chose not to update your files. Ending process...');
        process.exit();
      }
    })
    .catch(error => {
      if (error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
      } else {
        // Something else went wrong
      }
    });
};

scriptRunner();
