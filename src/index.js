const program = require('commander');
const VERSION = require('../package.json')['version'];
const ModuleMaker = require('./lib/npmqs');

program
  .version(VERSION)
  .usage('<directory name> [options]')
  .arguments('<dir>')
  .action((dir) => {
    new ModuleMaker(dir).initialize();
  });

program.parse(process.argv);
