'use strict';

var program = require('commander');
var VERSION = require('../package.json')['version'];
var ModuleMaker = require('./lib/npmqs');

program  
  .usage('<directory> [options]')
  // .arguments('<dir>')
  .option('-c, --css [engine]', 'specify stylesheet engine (sass|less|default: css)', 'css')
  .option('-i, --integration [tool]', 'specify continuous integration tool (default: travis)', 'travis')
  .option('-t, --test [framework]', 'specify test framework (default: mocha)', 'mocha')
  .version(VERSION, '-v, --version')
  .action(function (dir, options) {
    new ModuleMaker(dir, options);
});

program.parse(process.argv);