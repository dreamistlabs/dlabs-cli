import chalk from 'chalk';
import child_process from 'child_process';
import fs from 'fs';
import fileExists from 'file-exists';
import inquirer from 'inquirer';
import os from 'os';
import replace from 'replace-in-file';
import shell from 'shelljs';
import { COMMON, CONTINUOUS_INTEGRATION, NODE, QUALITY, TEST } from './configurations';
import DLError from './DLError';

export default class ProjectCreator {
  constructor(program) {
    this.IS_TEST_ENV = process.env.NODE_ENV === 'test';
    this.LOG_MESSAGES = {
      cannotFindDirectory: "Sorry, we couldn't find or access the target directory:",
      copyCICDFiles: 'Copying CI/CD files and configurations...',
      copyCommonFiles: 'Copying Common files and configurations...',
      copyProjectFiles: 'Copying Project files and configurations...',
      copyQualityFiles: 'Copying Quality files and configurations...',
      copyTestFiles: 'Copying Test files and configurations...',
      creatingDirectory: 'Creating project folder directory',
      directoryNotEmpty: 'The current directory is not empty. Please ensure it is and try again.',
      existingPackageJsonDetected:
        'An existing package.json file was detected in the current directory. Please remove and try again.',
      gitDetected: 'Git detected. Initializing project as a git repository.',
      installNPMPackages: 'Installing npm packages. This might take a couple of minutes.',
      noDirectorySpecified: 'No directory specified, so the current directory will be used.',
      noPackageJsonDetected: 'No package.json detected in current directory. Please try again.',
      noPathDetected: 'Unable to find dlabs-cli package location.',
      noProgramDetected:
        'No program detected. This is an error with @dreamistlabs/dlabs-cli, please open an issue on GitHub.',
      processCompleted:
        "The process has finished successfully. Please refer to the README.md file for more on what's included.",
      promptRelatedError:
        'There was an error with the user prompt interface. Please open an issue on GitHub.',
      setupReact: 'Setting up React using create-react-app. This may take a few minutes...',
      setupStorybook: 'Setting up Storybook. This may take a few minutes...',
      startProcess: '\nCreating a new project using @dreamistlabs/dlabs-cli in',
    };

    if (!program) {
      this._consoleOutput('error', this.LOG_MESSAGES.noProgramDetected);
    }

    this.program = program;
    this.prompt = inquirer.createPromptModule();
    this.os = os.type();
    this.isWindows = this.os === 'Windows_NT';
    this.isMac = this.os === 'Darwin';
    this.isLinux = this.os === 'Linux';
    this.REACT_PROJECT_TYPES = ['react', 'react-component'];
    this.BABEL_CONFIG_FILE = 'babel.config.json';
    this.ESLINT_FILE = '.eslintrc.json';
    this.JSCONFIG_FILE = 'jsconfig.json';
    this.TSCONFIG_FILE = 'tsconfig.json';
    this.PACKAGE_JSON_FILE = 'package.json';
    this.README_FILE = 'README.md';
    this.PATH = this._setPathLocation();
    // TODO: pipeline test fails attempting to look for dynmaic file path
    this.FILES_PATH = this.IS_TEST_ENV ? '../files' : `${this.PATH}/files`;
    this.project = { directory: program.args[0], name: program.args[0] };
    this.isReact = false;
    this.babelConfig = {};
    this.eslint = {};
    this.jsConfig = {};
    this.json = {};
    this.readme = '';
    this.name = {};

    this.USER_DEFAULTS = { useCICD: true, useQuality: true, useTesting: true };
    this.USER_QUESTIONS = [
      {
        type: 'list',
        name: 'type',
        message: 'Please select a project type.',
        choices: [
          { name: 'Node', value: 'node' },
          { name: 'React', value: 'react' },
          { name: 'React Component', value: 'react-component' },
        ],
        default: 'node',
      },
      {
        type: 'confirm',
        name: 'useTypeScript',
        message: 'Do you want to use TypeScript?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'useStorybook',
        message: 'Do you want to use Storybook?',
        default: false,
        when: answers => this.REACT_PROJECT_TYPES.includes(answers.type),
      },
      {
        type: 'confirm',
        name: 'useDefaults',
        message: 'Do you want to proceed with the default configurations?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'useQuality',
        message: 'Do you want to add code quality checks?',
        default: true,
        when: answers => !answers.useDefaults,
      },
      {
        type: 'confirm',
        name: 'useCICD',
        message: 'Do you want to add continuous integration?',
        default: true,
        when: answers => !answers.useDefaults,
      },
      {
        type: 'confirm',
        name: 'useTesting',
        message: 'Do you want to add testing?',
        default: true,
        when: answers => !answers.useDefaults && !this.REACT_PROJECT_TYPES.includes(answers.type),
      },
    ];

    /* istanbul ignore if */
    if (!this.IS_TEST_ENV) {
      this.run();
    }
  }

  async run() {
    await this._getProjectPreferences();

    this._setupProjectFiles()
      ._verifyPackageJson()
      ._setupCommonFiles()
      ._setupQualityFiles()
      ._setupContinuousIntegrationFiles()
      ._setupTestFiles()
      ._rewriteModifiedContentToFiles()
      ._initializeGit()
      ._installNPMPackages();

    shell.cd('..');
    this._consoleOutput('info', this.LOG_MESSAGES.processCompleted);
  }

  /**
   *
   * @returns
   */
  async _getProjectPreferences() {
    await this.prompt(this.USER_QUESTIONS)
      .then(userPreferences => {
        this.project = { ...this.project, ...this.USER_DEFAULTS, ...userPreferences };
        this.isReact = this.REACT_PROJECT_TYPES.includes(this.project.type);
      })
      .catch(this._userPreferenceErrorHandler);

    return this;
  }

  /**
   *
   */
  _setupProjectFiles() {
    const { copyProjectFiles, setupReact, setupStorybook } = this.LOG_MESSAGES;
    const { directory, useStorybook, useTypeScript, type } = this.project;

    // ignoring top-level isReact logic since it currently doesn't include anything
    // that isn't ignored by tests; will remove if this changes
    /* istanbul ignore if */
    if (this.isReact) {
      /* istanbul ignore if */
      if (!this.IS_TEST_ENV) {
        const includeTypeScript = useTypeScript ? ' --template typescript' : '';

        this._consoleOutput('info', setupReact);

        child_process.execSync(`npx create-react-app ${directory}${includeTypeScript}`);

        this._navigateToTargetDirectory(directory);

        if (useStorybook) {
          this._consoleOutput('info', setupStorybook);
          child_process.execSync(`npx storybook init`);
          // TODO: For TypeScript, may have to refer to: https://storybook.js.org/docs/react/configure/typescript
        }
      }
    } else {
      this._setupFolderDirectory()._navigateToTargetDirectory(directory);

      const filename = this._formatNameInPascalCase();
      const nodeFiles = [`${this.FILES_PATH}/${type}/*`, `${this.FILES_PATH}/${type}/.*`];

      this._consoleOutput('info', copyProjectFiles);
      shell.cp('-R', nodeFiles, '.');

      replace.sync({ files: [`src/**/*.js`], from: /Placeholder/g, to: filename });
      shell.mv(`src/lib/Placeholder.js`, `src/lib/${filename}.js`);

      this.babelConfig = this._loadFileContents('JSON', this.BABEL_CONFIG_FILE);
      this.jsConfig = this._loadFileContents('JSON', this.JSCONFIG_FILE);
      this.json = this._loadFileContents('JSON', this.PACKAGE_JSON_FILE);

      this._updatePackageFile('name', this.project.name);
      this._updatePackageFile('devDependencies', NODE.BASE.DEV_DEPENDENCIES);
      this._updatePackageFile('scripts', NODE.BASE.SCRIPTS);
      this._updateReadMeContent('node');

      if (useTypeScript) {
        this._updatePackageFile('devDependencies', NODE.TYPESCRIPT.DEV_DEPENDENCIES);
        this._updatePackageFile('scripts', NODE.TYPESCRIPT.SCRIPTS);

        this.eslint.parserOptions = {
          ...this.eslint.parserOptions,
          ...NODE.TYPESCRIPT.PARSER_OPTIONS,
        };

        this.jsConfig.compilerOptions = {
          ...this.jsConfig.compilerOptions,
          ...NODE.TYPESCRIPT.TSCONFIG.compilerOptions,
        };

        shell.mv('src/index.js', 'src/index.ts');
        shell.mv(`src/lib/${filename}.js`, `src/lib/${filename}.ts`);
      }
    }

    return this;
  }

  /**
   * Determines whether or not to create a new directory or
   * use the current directory and also checks if there are
   * files in the directory which would terminate the process.
   */
  _setupFolderDirectory() {
    const { noDirectorySpecified, startProcess } = this.LOG_MESSAGES;
    const { directory } = this.project;

    if (directory === '.') {
      this._consoleOutput('info', noDirectorySpecified);
    }

    // create directory if it doesn't exist
    if (!fs.existsSync(directory)) {
      shell.mkdir(directory);
    }

    this._consoleOutput('info', `${startProcess} ${shell.pwd()}`);

    return this;
  }

  /**
   * Setup common dependencies, scripts and files that should be included
   * by default based on the project type by default. This includes files
   * like gitignore, auto-changelog, cloc, vscode configurations; dependencies
   * like
   * @param {*} path
   */
  _setupCommonFiles() {
    const { DEV_DEPENDENCIES, SCRIPTS } = COMMON;
    const commonFiles = [`${this.FILES_PATH}/common/*`, `${this.FILES_PATH}/common/.*`];

    this._consoleOutput('info', this.LOG_MESSAGES.copyCommonFiles);
    shell.cp('-R', commonFiles, '.');
    shell.cp('-R', `${this.FILES_PATH}/readme/common.md`, '.');
    shell.mv(`common.md`, `README.md`);

    // TODO: Maybe always copy README? Dynamically inject more info into README
    // based on user options (useCICD, useQuality, etc)
    if (!this.isReact) {
      replace.sync({
        files: [this.README_FILE],
        from: /placeholder/g,
        to: this.project.name,
      });
    } else {
      // TODO override create-react-app readme for isReact projects?
    }

    // this current overrides any methods before this that also updates this.readme (projectFiles)
    this.readme = this._loadFileContents('README', this.README_FILE);
    this._updatePackageFile('devDependencies', DEV_DEPENDENCIES);
    this._updatePackageFile('scripts', SCRIPTS);

    return this;
  }

  /**
   * github actions?
   * @returns
   */
  _setupContinuousIntegrationFiles() {
    if (this.project.useCICD) {
      const { BASE, SCRIPTS } = CONTINUOUS_INTEGRATION;
      const cicdFiles = [`${this.FILES_PATH}/cicd/.*`];

      this._consoleOutput('info', this.LOG_MESSAGES.copyCICDFiles);
      shell.cp('-R', cicdFiles, '.');

      this._updatePackageFile('devDependencies', BASE.DEV_DEPENDENCIES);
      this._updatePackageFile('scripts', SCRIPTS);
      this._updateReadMeContent('cicd');
    }

    return this;
  }

  /**
   * commitlint, eslint, prettier, husky, madge
   * @returns
   */
  _setupQualityFiles() {
    if (this.project.useQuality) {
      const { BASE, REACT, TYPESCRIPT } = QUALITY;
      const qualityFiles = [`${this.FILES_PATH}/quality/.*`, `${this.FILES_PATH}/quality/*`];

      this._consoleOutput('info', this.LOG_MESSAGES.copyQualityFiles);
      shell.cp('-R', qualityFiles, '.');

      this.eslint = this._loadFileContents('JSON', this.ESLINT_FILE);
      this._updatePackageFile('devDependencies', BASE.DEV_DEPENDENCIES);
      this._updatePackageFile('scripts', BASE.SCRIPTS);
      this._updateReadMeContent('quality');

      const { parserOptions, rules, settings } = this.eslint;

      if (this.REACT_PROJECT_TYPES.includes(this.project.type)) {
        // Remove the eslintConfig property injected by create-react-app.
        delete this.json.eslintConfig;

        // full stack inclusion will likely need these eslint declarations
        this.eslint.extends = this.eslint.extends.concat(REACT.EXTENDS);
        this.eslint.plugins = this.eslint.plugins.concat(REACT.PLUGINS);
        this.eslint.parserOptions = { ...parserOptions, ...REACT.PARSER_OPTIONS };
        this.eslint.rules = { ...rules, ...REACT.RULES };
        this.eslint.settings = { ...settings, ...REACT.SETTINGS };

        this._updatePackageFile('devDependencies', REACT.DEV_DEPENDENCIES);
      }

      // TODO: Fullstack option - we will probably need to manually add
      // certain eslint plugins and extensions for fullstack boilerplate projects
      // if (this.project.type === "fullstack") {
      //   this.devDependencies = this.devDependencies.concat(
      //     FULLSTACK.DEV_DEPENDENCIES
      //   );
      // }

      // do a typescript check or create it's own function?
      if (this.project.useTypeScript) {
        this.babelConfig.presets = this.babelConfig.presets.concat(TYPESCRIPT.BABEL.PRESETS);

        this.eslint.extends = this.eslint.extends.concat(TYPESCRIPT.EXTENDS);
        this.eslint.parser = TYPESCRIPT.PARSER;
        this.eslint.parserOptions = { ...parserOptions, ...TYPESCRIPT.PARSER_OPTIONS };
        this.eslint.plugins = this.eslint.plugins.concat(TYPESCRIPT.PLUGINS);

        this._updatePackageFile('devDependencies', TYPESCRIPT.DEV_DEPENDENCIES);
      }
    }

    return this;
  }

  /**
   * jest
   */
  _setupTestFiles() {
    if (this.project.useTesting) {
      const { BASE, REACT, TYPESCRIPT } = TEST;

      this._consoleOutput('info', this.LOG_MESSAGES.copyTestFiles);
      shell.cp('-R', [`${this.FILES_PATH}/test/__mocks__`], '.');

      this._updatePackageFile('devDependencies', BASE.DEV_DEPENDENCIES);
      this._updatePackageFile('scripts', BASE.SCRIPTS);
      this._updateReadMeContent('test');

      this.eslint.extends = this.eslint.extends.concat(BASE.EXTENDS);
      this.eslint.plugins = this.eslint.plugins.concat(BASE.PLUGINS);
      this.eslint.rules = { ...this.eslint.rules, ...BASE.RULES };
      this.eslint.settings = { ...this.eslint.settings, ...BASE.SETTINGS };
      this.json.jest = BASE.CONFIG;

      if (this.isReact) {
        const { moduleFileExtensions, moduleNameMapper } = this.json.jest;

        this._updatePackageFile('dependencies', REACT.DEPENDENCIES);
        this._updatePackageFile('devDependencies', REACT.DEV_DEPENDENCIES);

        this.eslint.extends = this.eslint.extends.concat(REACT.EXTENDS);
        this.eslint.plugins = this.eslint.plugins.concat(REACT.PLUGINS);
        this.eslint.rules = { ...this.eslint.rules, ...REACT.RULES };
        this.json.jest = {
          ...this.json.jest,
          moduleFileExtensions: moduleFileExtensions.concat(REACT.CONFIG.moduleFileExtensions),
          moduleNameMapper: { ...moduleNameMapper, ...REACT.CONFIG.moduleNameMapper },
        };
      } else {
        shell.cp('-R', [`${this.FILES_PATH}/test/index.test.js`], 'src');

        replace.sync({
          files: 'src/index.test.js',
          from: /Placeholder/g,
          to: this._formatNameInPascalCase(),
        });

        if (this.project.useTypeScript) {
          this._updatePackageFile('devDependencies', TYPESCRIPT.DEV_DEPENDENCIES);

          this.json.jest = {
            ...this.json.jest,
            moduleFileExtensions: TYPESCRIPT.CONFIG.moduleFileExtensions,
            preset: TYPESCRIPT.CONFIG.preset,
            testRegex: TYPESCRIPT.CONFIG.testRegex,
          };

          shell.mv('src/index.test.js', 'src/index.test.ts');
        }
      }
    }

    return this;
  }

  _consoleOutput(type, message) {
    if (type === 'error') {
      /* istanbul ignore next */
      !this.IS_TEST_ENV && shell.echo(chalk.red(message));
      throw new DLError(message);
    } else {
      /* istanbul ignore next */
      !this.IS_TEST_ENV && shell.echo(chalk.white(message));
      shell.exec('sleep 1');
    }
  }

  /**
   *
   * @returns
   */
  _formatNameInPascalCase() {
    return this.project.name
      .split(/[^A-Za-z0-9]/g)
      .map(str => str[0].toUpperCase() + str.slice(1).toLowerCase())
      .join('');
  }

  _initializeGit() {
    // check if git is installed
    if (shell.which('git')) {
      this._consoleOutput('info', this.LOG_MESSAGES.gitDetected);

      /* istanbul ignore if  */
      if (!this.IS_TEST_ENV) {
        shell.exec('git init');
      }
    }

    return this;
  }

  /**
   *
   * @returns
   */
  _installNPMPackages() {
    this._consoleOutput('info', this.LOG_MESSAGES.installNPMPackages);

    /* istanbul ignore if  */
    if (!this.IS_TEST_ENV) {
      shell.exec('npm install');
    }

    return this;
  }

  _isInTargetDirectory(directory) {
    return shell.pwd().stdout.includes(directory);
  }

  _loadFileContents(type = 'JSON', fileLocation) {
    return type === 'JSON'
      ? JSON.parse(fs.readFileSync(fileLocation, 'utf-8'))
      : fs.readFileSync(fileLocation, 'utf8');
  }

  _navigateToTargetDirectory(directory) {
    let isInTargetDirectory = shell.pwd().stdout.includes(directory);

    // try to navigate to directory if not already in it.
    if (!isInTargetDirectory) {
      shell.cd(directory);
      isInTargetDirectory = shell.pwd().stdout.includes(directory);
    }

    // if it's still not in target directory, exit process
    if (!isInTargetDirectory) {
      this._consoleOutput('error', `${this.LOG_MESSAGES.cannotFindDirectory} ${this.project.name}`);
    }

    // check if directory is not empty
    if (fs.readdirSync('.').length > 0) {
      this._consoleOutput('error', this.LOG_MESSAGES.directoryNotEmpty);
    }

    return this;
  }

  /**
   *
   * @returns
   */
  _rewriteModifiedContentToFiles() {
    const { dependencies, devDependencies, optionalDependencies, jest, scripts } = this.json;

    // Reorder the following properties in package.json
    if (dependencies) {
      this.json.dependencies = this._sortEntries(dependencies);
    }

    if (devDependencies) {
      this.json.devDependencies = this._sortEntries(devDependencies);
    }

    if (optionalDependencies) {
      this.json.optionalDependencies = this._sortEntries(optionalDependencies);
    }

    if (jest) {
      this.json.jest = this._sortEntries(jest);
    }

    if (scripts) {
      this.json.scripts = this._sortEntries(scripts);
    }
    // Should we rename the index file? how about the main property in package.json?
    // fs.renameSync("src/index.js", `src/${this.json.name}.js`);
    // this._updatePackageFile("main", `./src/${this.json.name}.js`);

    // Rewrite updated this.babelConfig content to babel.config.json file.
    this._writeContentsToFile('JSON', this.BABEL_CONFIG_FILE, this.babelConfig);

    // Rewrite updated this.eslint content to .eslintrc.json file.
    this._writeContentsToFile('JSON', this.ESLINT_FILE, this.eslint);

    // Rewrite updated this.jsconfig content to jsconfig.json file.
    this._writeContentsToFile('JSON', this.JSCONFIG_FILE, this.jsConfig);

    // Rewrite updated this.json content to package.json file.
    this._writeContentsToFile('JSON', this.PACKAGE_JSON_FILE, this.json);

    // Rewrite updated this.readme content to README.md file.
    this._writeContentsToFile('README', this.README_FILE, this.readme);

    // Rename jsconfig.json to tsconfig.json
    if (this.project.useTypeScript) {
      shell.mv(this.JSCONFIG_FILE, this.TSCONFIG_FILE);
    }

    return this;
  }

  // LOCATION finds the user's root folder where dlabs-cli is installed.
  // PATH adds the FILES_PATH to dlabs-cli's module files.
  _setPathLocation() {
    // TODO need better way to differentiate between macOS and Windows FILES_PATHs
    let dlabsLocation = shell.which('dlabs-cli').stdout.trim();

    /* istanbul ignore if */
    if (dlabsLocation[0] === '/') {
      dlabsLocation = dlabsLocation.replace(/(\/\w+){1}$/, '');
      return `${dlabsLocation}/lib/node_modules/dlabs-cli`;
    } else if (dlabsLocation.includes('C:')) {
      dlabsLocation = dlabsLocation.replace(/\\DLABS-CLI.CMD/, '').replace(/\\\\/g, '\\');
      return `${dlabsLocation.toLowerCase()}\\node_modules\\dlabs-cli`;
    } else {
      this._consoleOutput('error', this.LOG_MESSAGES.noPathDetected);
    }
  }

  _sortEntries(object) {
    const sortedEntries = Object.entries(object).sort((a, b) => a[0].localeCompare(b[0]));

    return Object.fromEntries(sortedEntries);
  }

  _verifyPackageJson() {
    if (!fileExists.sync(this.PACKAGE_JSON_FILE)) {
      this._consoleOutput('error', this.LOG_MESSAGES.noPackageJsonDetected);
    }

    return this;
  }

  /**
   *
   * @param {*} key
   * @param {*} value
   */
  _updatePackageFile(key, value) {
    if (!this.json[key]) {
      this.json[key] = value instanceof Object ? {} : '';
    }
    if (value instanceof Object) {
      this.json[key] = Object.assign(this.json[key], value);
    } else {
      this.json[key] = value;
    }
  }

  _updateReadMeContent(filename) {
    const content = this._loadFileContents('README', `${this.FILES_PATH}/readme/${filename}.md`);

    this.readme = this.readme.concat(`\n\n${content}`);
  }

  _userPreferenceErrorHandler(error) {
    this._consoleOutput('error', error?.message || this.LOG_MESSAGES.promptRelatedError);
  }

  _writeContentsToFile(type = 'JSON', fileLocation, fileContent) {
    const content = type === 'JSON' ? JSON.stringify(fileContent, null, 2) : fileContent;

    fs.writeFileSync(fileLocation, content);
  }
}
