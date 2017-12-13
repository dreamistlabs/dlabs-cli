'use strict';

/**
 * helper libraries 
 */
const shell = require('shelljs');
const child_process = require('child_process');
const fs = require('fs');
const fileExists = require('file-exists');
const replace = require('replace-in-file');

const BabelInstaller = require('./installers/BabelInstaller');
const MochaInstaller = require('./installers/MochaInstaller');
const PACKAGE_JSON = 'package.json';
let json;

const _createNewPackage = async (directory) => {

  // LOCATION finds the user's root folder where npmqs is installed.
  // PATH adds the filepath to npmqs-cli's module files.
	const LOCATION = shell.exec('which npmqs', {silent: true})
											  .stdout
											  .trim()
											  .replace(/(\/\w+){2}$/, '');
  const PATH = LOCATION + '/lib/node_modules/npmqs-cli';   // console.log(LOCATION, PATH);

  shell.exec('echo Preparing npm package starter process... && sleep 2');
  shell.mkdir(directory);
  shell.cd(directory);

  let fileExist = await fileExists(PACKAGE_JSON);

  if (!fileExist) _createPackageJson();

  fs.readFile(PACKAGE_JSON, 'utf-8', async (err, data) => {
    
    if (err) throw err;

    json = await JSON.parse(data);

    _setupFileStructure();

  });

  setTimeout(() => {
    //copy template test file based on test framework
    shell.cp('-R', PATH + '/files/mocha-chai.test.js', 'test/');
    fs.renameSync('test/mocha-chai.test.js', 'test/'+json.name+'.test.js');

    //copy template index file and rename it based on project name
    shell.cp('-R', PATH + '/files/index.js', 'src/');
    replace({
      files: 'src/index.js',
      from: /placeholder/g,
      to: json.name
    })

    new BabelInstaller(PATH, null);

    _installTestFramework();

  }, 1500);  

};

const _createPackageJson = () => {

  child_process.execSync('npm init', { stdio: 'inherit' });

};

// need to document the file structure here
const _setupFileStructure = () => {
  const LIB_MAIN = `src/lib/${json.name}.js`;

  shell.exec('mkdir src && mkdir src/lib');
  shell.exec(`touch ${LIB_MAIN}`);
  shell.mkdir('test');

};

function _installTestFramework(framework = 'mocha') {

  switch (framework) {
    case 'mocha':
      new MochaInstaller();
  }
}

function writeScripts(json) {
  json.scripts.test = 'mocha --reporter spec';

  json.scripts.compile = 'babel src -d lib -s inline';

  json.scripts.watch = 'babel src -d lib -w';
}

function _pointMainEntryFileToDistributionFolder(json) {

  json.main = 'index.js';

}

function rewriteJson() {
  // fs.writeFile(fileName, JSON.stringify(json, null, 2), function(err) {
  //   //   if (err) return console.log(err);
  //   // })
}

module.exports = _createNewPackage;