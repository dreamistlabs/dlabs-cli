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
 *  |   |-- lib
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
  constructor(directory, command) {
    this.directory = directory
  , this.command = command
  , this.PACKAGE_JSON = 'package.json'
  , this.PATH = this.setPathLocation()
  , this.json = {};

    this.run();
  }

  run() {
    shell.exec('echo Starting npmqs process... && sleep 1');
    shell.mkdir(this.directory);
    shell.cd(this.directory);

    this.setupPackageJson()
        .setupFiles('core')
        .setupFiles('ci')
        .setupFiles('test')
        .setupFiles('webpack')
        .rewritePackageJson()
  }

  /*!
   * 
   */
  // check for existing package.json file, running npm init if one doesn't exist.
  setupPackageJson() {
    let fileExist = fileExists.sync(this.PACKAGE_JSON);
    if (!fileExist) {
      child_process.execSync('npm init', { stdio: 'inherit' });
      fileExist = fileExists.sync(this.PACKAGE_JSON);
    }

    if (fileExist) {
      this.json = JSON.parse(fs.readFileSync(this.PACKAGE_JSON, 'utf-8'));  
    } else {
      throw Error('You need to initialize a package.json file in order to run npmqs. Please try again');
    }
    return this;
  }

  setupFiles(category) {
    const FILEPATH = `${this.PATH}/files`;
    switch (category) {
      case 'core':
        this.setupCoreFiles(FILEPATH);
        break;
      case 'ci':
        this.setupContinuousIntegration(FILEPATH);
        break;
      case 'test':
        this.setupTestFiles(FILEPATH);
        break;
      case 'webpack':
        this.setupWebpack(FILEPATH);
        break;
      default:
        break;
    }

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

  setupCoreFiles(path) {
    let coreFiles = [`${path}/core/*`, `${path}/.*`]; 
    shell.cp('-R', coreFiles, '.');
    fs.renameSync('src/index.js', `src/${this.json.name}.js`);
    replace({
      files: ['README.md',],
      from: /placeholder/g,
      to: this.json.name
    });
    this.updatePackageFile('devDependencies', {
      "babel-core": "^6.26.0",
      "babel-preset-env": "^1.6.1"
    });
    this.updatePackageFile('main',`./src/${this.json.name}.js`);
  }
  setupContinuousIntegration(path) {
    let ciFiles = [`${path}/ci/.*`];
    shell.cp('-R', ciFiles, '.');
    this.updatePackageFile('devDependencies', {
      coveralls: "^2.13.1",
      istanbul: "^1.0.0-alpha"
    });
    this.updatePackageFile('scripts', {
      cover: "node_modules/istanbul/lib/cli.js cover node_modules/mocha/bin/_mocha -- -R spec test/* --require babel-register",
    });
  }

  setupTestFiles(path) {
    let testFiles = [`${path}/test/*`];
    if (!shell.test('-d', 'test')) {
      shell.mkdir('test');
    };
    shell.cp('-R', testFiles, 'test');
    replace({
      files: [`test/${this.json.name}.test.js`],
      from: /placeholder/g,
      to: this.json.name
    });
    this.updatePackageFile('devDependencies', {
      "babel-register": "^6.26.0",
      chai: "^4.0.2",
      mocha: "^3.4.2"
    });
    this.updatePackageFile('scripts', {
      test: "mocha -R spec test/* --require babel-register"
    });
  }

  setupWebpack(path) {
    let webpackFiles = [`${path}/webpack/*`];
    shell.cp('-R', webpackFiles, '.');
    replace({
      files: ['webpack.config.js'],
      from: /placeholder/g,
      to: this.json.name
    });
    this.updatePackageFile('devDependencies', {
      "babel-loader": "^7.1.2",
      webpack: "^3.10.0"
    });
    this.updatePackageFile('scripts', {
      build: "webpack",
      prepublishOnly: "npm run build"
    });
  }

  updatePackageFile(key, value) {
    if (!this.json[key]) {
      this.json[key] = value instanceof Object ? {} : '';
    }
    if (value instanceof Object) {
      this.json[key] = Object.assign(this.json[key], value);
    } else {
      this.json[key] = value;
    }
  }

  rewritePackageJson() {
    fs.writeFileSync(this.PACKAGE_JSON, JSON.stringify(this.json, null, 2));
    return this;
  }

}
