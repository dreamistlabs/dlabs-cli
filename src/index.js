'use strict';

var program = require('commander');
var VERSION = require('../package.json')['version'];
var ModuleMaker = require('./lib/npmqs');

program
  .version(VERSION)
  .usage('<directory name> [options]')
  .arguments('<dir>')
  .action(function (dir) {
    new ModuleMaker(dir).initialize();
});

program.parse(process.argv);