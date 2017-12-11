'use strict';

const shell = require('shelljs');
const child_process = require('child_process');
const fs = require('fs');
const fileExists = require('file-exists');
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

  if (!fileExist) _createJsonPackageFile();

  fs.readFile(PACKAGE_JSON, 'utf-8', async (err, data) => {
    
    if (err) throw err;

    json = await JSON.parse(data);

    console.log('inside', json.main);

    // _setupTestFramework(json);

    // _setupBabelCompiling(json);

    // _pointMainEntryFileToDistributionFolder(json);

    console.log('after:', json);

    _setupFileStructure();

  });

  // _installDependencies();
  _createBabelrc(PATH);

};

const _setupFileStructure = () => {
  const MAIN = `src/index.js`;
  const LIB_MAIN = `src/lib/${json.name}.js`;

  shell.exec('mkdir src && mkdir src/lib');
  shell.exec(`touch ${MAIN} && touch ${LIB_MAIN}`);
  shell.mkdir('test');

  // copy test file from files/ folder based on test framework

};
const _createJsonPackageFile = () => {
  child_process.execSync('npm init', { stdio: 'inherit' });
  return PACKAGE_JSON;
};

const _installDependencies = () => {
  _installTestFramework();
  _installBabel(_createBabelrc);
}
const _createEntryFile = (json) => {

  // const content = `'use strict';\n\nrequire('./src/lib/${json.name}.js);`;

  // fs.writeFile(entry, content, err => { if (err) throw err; });

};

function _setupTestFramework(json) {

  shell.exec(`mkdir test && touch test/${json.name}.test.js`);

}

function _installTestFramework(framework = "mocha") {

  switch (framework) {
    case "mocha":
      shell.echo("ordering mocha and chai... ☕️ ");
      shell.exec("sleep 2 && npm install -D chai mocha");
  }
}

function writeScripts(json) {
  json.scripts.test = "mocha --reporter spec";

  json.scripts.compile = "babel src -d lib -s inline";

  json.scripts.watch = "babel src -d lib -w";
}

function _installBabel(callback) {
  // const content = `[\n  "presets": ["env"]\n]`;

  shell.echo("fetching babel... 🗣");

  shell.exec("sleep 2 && npm install -D babel-cli babel-preset-env");

  shell.exec('npm install --save babel-polyfill');

  // fs.writeFile(".babelrc", content, err => {
  //   if (err) throw err;
  // });

  callback();
}

const _createBabelrc = (PATH) => {
  const FILE = PATH + '/files/.babelrc';
  shell.cp('-R', FILE, '.');

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