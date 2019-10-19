#!/usr/bin/env node

// TODO: Find a way to reduce the files in bin/ folder and move the compiled files back to a build/ folder while keeping the git-style subcommands' file structure intact.

const program = require('commander');
const VERSION = require('../package.json')['version'];

program.command('new <type> [directory]', 'setup a new project');
program.command('add <type> [directory]', 'add to an existing project');

program
  .usage('<cmd>')
  // .arguments('<dir>')
  // .option('-c, --css [engine]', 'specify stylesheet engine (sass|less|default: css)', 'css')
  // .option(
  //   '-i, --integration [tool]',
  //   'specify continuous integration tool (default: travis)',
  //   'travis'
  // )
  // .option('-t, --test [framework]', 'specify test framework (default: mocha)', 'mocha')
  .version(VERSION, '-v, --version')
  .parse(process.argv);
