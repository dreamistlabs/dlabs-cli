const program = require("commander");
const shell = require("shelljs");
const child_process = require("child_process");
const fs = require("fs");
const fileExists = require("file-exists");

const VERSION = require("../package.json")["version"];
const PACKAGE_JSON = "package.json";

const _setupNewPackage = async () => {
  let fileExist = await fileExists(PACKAGE_JSON);

  if (!fileExist) _createJsonPackageFile();

  fs.readFile(PACKAGE_JSON, "utf-8", async (err, data) => {
    if (err) throw err;

    let json = JSON.parse(data);

    console.log(json.main);


    _setupTestFramework(json);

    _setupBabelCompiling(json);

    _pointMainEntryFileToDistributionFolder(json);

  });

};

const _createJsonPackageFile = () => {

  child_process.execSync("npm init", { stdio: "inherit" });

  return PACKAGE_JSON;

};

const _createFilesAndFolders = json => {

  _createEntryFile(json);

  _createSourceDirectoryAndFile(json);


}
const _createEntryFile = (json) => {

  const entry = `src/${json.name}`;

  // const content = `'use strict';\n\nrequire('./src/${json.name}.js);`;

  shell.touch(entry);

  // fs.writeFile(entry, content, err => { if (err) throw err; });

};

const _createSrcDirectoryAndFile = (json) => {

  shell.exec(`mkdir src && touch src/${json.name}.js`);

}

function _setupTestFramework(json) {

  shell.exec(`mkdir test && touch test/${json.name}.test.js`);

}

function _mocha(json, framework = "mocha") {

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

function _setupBabelCompiling(json) {
  const content = `[\n  "presets": ["env"]\n]`;

  shell.echo("fetching babel... 🗣");

  shell.exec("sleep 2 && npm install -D babel-cli babel-preset-env");

  shell.exec('npm install --save babel-polyfill');

  fs.writeFile(".babelrc", content, err => {
    if (err) throw err;
  });
}

function _pointMainEntryFileToDistributionFolder(json) {

  json.main = 'index.js';

}

function rewriteJson() {
  // fs.writeFile(fileName, JSON.stringify(json, null, 2), function(err) {
  //   //   if (err) return console.log(err);
  //   // })
}

program
  .version(VERSION)
  .arguments("<dir>")
  .action((dir) => {
    shell.exec("echo Preparing npm package starter process... && sleep 2");
    shell.mkdir(dir);
    shell.cd(dir);

    _setupNewPackage();
  });

program.parse(process.argv);
