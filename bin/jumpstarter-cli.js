#!/usr/bin/env node

const program = require('commander');
const shell = require('shelljs');
const child_process = require('child_process');
const jq = require('node-jq');
const fs = require('fs');


function setupNewPackage() {


  const fileName = createJsonPackageFile();
  let json = JSON.parse(fs.readFile(fileName, 'utf-8'));

  // createMainEntryFile(json);

  // createLibsDirectoryAndFile(json);

  // setupTestFramework(json);

  // setupBabel(json);

  // pointMainEntryFileToDistributionFolder(json);

}

function createJsonPackageFile() {
  fs.stat('package.json', function(err, stat) {
    if (err && err.code == 'ENOENT') {
      child_process.execSync('npm init', {stdio: 'inherit'});
    }
  });
}

function createMainEntryFile(json) {
  const content = `'use strict';\n\nrequire('./lib/${json.name}.js`;
  shell.touch(json.main);
  fs.fileWrite(json.main, content, function(err) {
    if (err) return console.log(err);
  })
}

function createLibsDirectoryAndFile(json) {
  shell.exec('mkdir lib && touch lib/' + json.name +'.js');
}

function setupTestFramework(json, framework = 'mocha') {
  shell.exec('mkdir test && touch test/test.js');

  switch (framework) {
    case 'mocha':
      shell.echo('ordering mocha and chai... ☕️ ');
      shell.exec('sleep 2 && npm install -D chai mocha');
      json.scripts.test = "mocha --reporter spec";
  }
}

function setupBabel(json) {
  shell.echo('fetching babel... 🗣');
  shell.exec('sleep 2 && npm install -D babel-cli babel-preset-env')
  json.scripts.babel = "build " + json.main + " -d dist -s --presets=env";
}

function pointMainEntryFileToDistributionFolder(json) {
  json.main = "./dist/" + json.main;
}


program
  .version('0.0.1')
  .arguments('<dir>')
  .usage('<dir>')
  .action(function(dir) {
    let fileName, json;
    shell.exec('echo Preparing npm package starter process... && sleep 2');
    shell.mkdir(dir);
    shell.cd(dir);

    // setupNewPackage();
    fs.stat('package.json', function(err, stat) {
      if (err && err.code == 'ENOENT') {
        child_process.execSync('npm init', {stdio: 'inherit'});
        fileName = 'package.json';
        json = JSON.parse(fs.readFile(fileName, 'utf-8'));
      }
    });


    // let json = JSON.parse(fs.readFile(fileName, 'utf-8'));

    // fs.writeFile(fileName, JSON.stringify(json, null, 2), function(err) {
    //   if (err) return console.log(err);
    // })

  })
  .parse(process.argv);

console.log('stuff work down here?');