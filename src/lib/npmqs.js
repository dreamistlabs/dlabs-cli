/**
 * helper libraries
 */
const shell = require('shelljs');
const child_process = require('child_process');
const fs = require('fs');
const fileExists = require('file-exists');
const replace = require('replace-in-file');

module.exports = class ModuleMaker {
  constructor(directory) {
    this.directory = directory;
    this.PACKAGE_JSON = 'package.json';
    this.PATH = this.setPathLocation();
    this.json = {};
  }

  initialize() {
    shell.exec('echo Preparing npm quickstart process... && sleep 1');
    shell.mkdir(this.directory);
    shell.cd(this.directory);

    this.createPackageJson()
        .convertJson()
        .setupFileStructure()
        .addReadme()
        .copyFiles()
        .updateJson()
        .rewriteJson()
        .installDependencies();
  }

  addReadme() {
    const README = 'README.md';
    shell.touch(README);
    fs.writeFileSync(README, `# ${this.json.name}`);
    return this;
  }

  // check for existing package.json file, running npm init if one doesn't exist.
  createPackageJson() {
    let fileExist = fileExists.sync(this.PACKAGE_JSON);
    if (!fileExist) child_process.execSync('npm init', { stdio: 'inherit' });
    return this;
  }

  copyFiles() {
    const FILEPATH = this.PATH + '/files';

    // copy boilerplate index file and rename code within it to match project name.
    shell.cp('-R', `${FILEPATH}/index.js`, 'src/');
    replace({
      files: 'src/index.js',
      from: /placeholder/g,
      to: this.json.name
    });

    // copy boilerplate lib file and rename it to match project name.
    shell.cp('-R', `${FILEPATH}/lib-main.js`, './src/lib/');
    fs.renameSync('src/lib/lib-main.js', `src/lib/${this.json.name}.js`);

    // copy boilerplate test file and rename it to match project name.
    shell.cp('-R', `${FILEPATH}/mocha-chai.test.js`, 'test/');
    fs.renameSync('test/mocha-chai.test.js', 'test/'+this.json.name+'.test.js');

    // copy remaining files that don't require any modifications
    shell.cp('-R', [`${FILEPATH}/.babelrc`, `${FILEPATH}/.gitignore`, `${FILEPATH}/.npmignore`, `${FILEPATH}/CHANGELOG.md`], '.');

    return this;
  }

  installDependencies() {
    shell.echo("Hang tight! You're almost done. Just need to install some dependencies...");
    shell.exec("npm install");
    shell.echo('All done! Happy coding!');
  }

  convertJson() {
    this.json = JSON.parse(fs.readFileSync(this.PACKAGE_JSON, 'utf-8'));
    return this;
  }

  /** file structure
   *  |-- root <project-name>
   *  |   |-- bin  (cli)
   *  |   |-- dist (distribution files, usually minified browser-ready files)
   *  |   |-- lib  (production files)
   *  |   |-- src
   *  |   |   |-- libs
   *  |   |   |   |-- <project-name>.js
   *  |   |   |-- index.js
   *  |   |-- test
   *  |   |   |-- <project-name>.test.js
   *  |   |-- .babelrc
   *  |   |-- .gitignore
   *  |   |-- .npmignore
   *  |   |-- package.json
   *  |   |-- README.md
   */
  setupFileStructure() {
    shell.exec('mkdir -p src/lib && mkdir test');
    return this;
  }

  setPathLocation() {
    // LOCATION finds the user's root folder where npmqs is installed.
    // PATH adds the filepath to npmqs-cli's module files.
    const npmqsLocation = shell.exec('which npmqs', {silent: true})
                               .stdout
                               .trim()
                               .replace(/(\/\w+){2}$/, '');
    return npmqsLocation + '/lib/node_modules/npmqs-cli';
  }

  updateJson() {
    this.json.main = './src/index.js';
    this.json.scripts = {
      "compile": "babel src -d build -s inline",
      "cover": "node_modules/istanbul/lib/cli.js cover node_modules/mocha/bin/_mocha -- --require babel-register -R spec test/*",
      "prepublishOnly": "npm run compile",
      "test": "mocha --require babel-register --reporter spec",
      "watch": "babel src -d build -w"
    }
    this.json.devDependencies = {
      "babel-cli": "^6.24.1",
      "babel-polyfill": "^6.26.0",
      "babel-preset-env": "^1.6.1",
      "babel-register": "^6.26.0",
      "chai": "^4.0.2",
      "coveralls": "^2.13.1",
      "istanbul": "^0.4.5",
      "mocha": "^3.4.2"
    }
    return this;
  }


  rewriteJson() {
    fs.writeFileSync(this.PACKAGE_JSON, JSON.stringify(this.json, null, 2));
    return this;
  }

}
