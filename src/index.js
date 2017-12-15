'use strict';

const program = require('commander');
const VERSION = require('../package.json')['version'];
const createNewPackage = require('./lib/npmqs');

program
  .version(VERSION)
  .usage('<directory name> [options]')
  .arguments('<dir>')
  .action((dir) => {
    createNewPackage(dir);
  });

program.parse(process.argv);
