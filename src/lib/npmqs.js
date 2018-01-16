/**
 * helper libraries
 */
const shell = require('shelljs');
const child_process = require('child_process');
const fs = require('fs');
const fileExists = require('file-exists');
const replace = require('replace-in-file');

/** file structure
 *  |-- root <project-name>
 *  |   |-- bin (cli)
 *  |   |-- dist
 *  |   |-- src
 *  |   |   |-- <project-name>.js
 *  |   |-- test
 *  |   |   |-- <project-name>.test.js
 *  |   |-- .babelrc
 *  |   |-- .gitignore
 *  |   |-- .istanbul.yml
 *  |   |-- .npmignore
 *  |   |-- .travis.yml
 *  |   |-- CHANGELOG.md
 *  |   |-- package.json
 *  |   |-- README.md
 *  |   |-- webpack.config.js
 */

module.exports = class ModuleMaker {

  constructor(directory) {
    this.directory = directory,
    this.PACKAGE_JSON = 'package.json',
    this.PATH = this.setPathLocation(),
    this.json = {};

    this.initialize();
  }

  initialize() {
    shell.exec('echo Starting npmqs process... && sleep 1');
    shell.mkdir(this.directory);
    shell.cd(this.directory);

    this.createPackageJson()
        .parsePackageJson()
        .migrateFiles()
        .updatePackageJson()
        .rewritePackageJson()
  }

  // check for existing package.json file, running npm init if one doesn't exist.
  createPackageJson() {
    let fileExist = fileExists.sync(this.PACKAGE_JSON);
    if (!fileExist) child_process.execSync('npm init', { stdio: 'inherit' });
    return this;
  }

  parsePackageJson() {
    this.json = JSON.parse(fs.readFileSync(this.PACKAGE_JSON, 'utf-8'));
    return this;
  }

  migrateFiles() {
    const FILEPATH = `${this.PATH}/files`;
    shell.cp('-R', [`${FILEPATH}/*`, `${FILEPATH}/.*`], '.');

    fs.renameSync('src/index.js', `src/${this.json.name}.js`);

    fs.renameSync('test/mocha-chai.test.js', 'test/'+this.json.name+'.test.js');

    replace({
      files: [
        'README.md',
        'webpack.config.js',
        `test/${this.json.name}.test.js`
      ],
      from: /placeholder/g,
      to: this.json.name
    });

    return this;
  }

  // LOCATION finds the user's root folder where npmqs is installed.
  // PATH adds the filepath to npmqs-cli's module files.
  setPathLocation() {
    const npmqsLocation = shell.exec('which npmqs', { silent: true })
                               .stdout.trim()
                               .replace(/(\/\w+){2}$/, '');
    return `${npmqsLocation}/lib/node_modules/npmqs-cli`;
  }

  updatePackageJson() {
    this.json.main = `./src/${this.json.name}.js`;
    this.json.scripts = {
      "build": "webpack",
      "cover": "node_modules/istanbul/lib/cli.js cover node_modules/mocha/bin/_mocha -- -R spec test/* --require babel-register",
      "prepublishOnly": "npm run build",
      "test": "mocha -R spec test/* --require babel-register"
    }
    this.json.devDependencies = {
      "babel-core": "^6.26.0",
      "babel-loader": "^7.1.2",
      "babel-preset-env": "^1.6.1",
      "babel-register": "^6.26.0",
      "chai": "^4.0.2",
      "coveralls": "^2.13.1",
      "istanbul": "^1.0.0-alpha",
      "mocha": "^3.4.2",
      "webpack": "^3.10.0"
    }
    return this;
  }


  rewritePackageJson() {
    fs.writeFileSync(this.PACKAGE_JSON, JSON.stringify(this.json, null, 2));
    return this;
  }

}
