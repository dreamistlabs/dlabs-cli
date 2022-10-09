import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';
import os from 'os';
import replace from 'replace-in-file';
import shell from 'shelljs';
import execInColor from 'shelljs-live';
import { CONFIGURATIONS, preparePackageJsonForExport } from './configurations';
import DLError from './DLError';
import pkg from '../../package.json';

const { DLABS, NODE, NODE_TS, REACT, REACT_TS } = CONFIGURATIONS;

export default class ProjectCreator {
  constructor(program) {
    this.IS_TEST_ENV = process.env.NODE_ENV === 'test';
    this.IS_PROD_ENV = process.env.NODE_ENV === 'production';

    if (!program) {
      const errMessage = `No program detected. This is an error with ${pkg.name}, please open an issue on GitHub.`;
      this.print(chalk.red(errMessage));
      this.print(pkg.bugs.url);
      throw new DLError(errMessage);
    }

    if (this.os === 'Linux') {
      const errMessage = 'Sorry, Linux OS is not currently supported.';
      this.print(chalk.red(errMessage));
      throw new DLError(errMessage);
    }

    this.program = program;
    this.prompt = inquirer.createPromptModule();
    this.os = os.type();
    this.isWindows = this.os === 'Windows_NT';
    this.isMac = this.os === 'Darwin';
    this.isLinux = this.os === 'Linux';
    this.isGitEnabled = !this.IS_TEST_ENV && shell.which('git');
    this.REACT_PROJECT_TYPES = ['react', 'react-component'];
    this.BABEL_CONFIG_FILE = 'babel.config.json';
    this.ESLINT_FILE = '.eslintrc.json';
    this.JSCONFIG_FILE = 'jsconfig.json';
    this.TSCONFIG_FILE = 'tsconfig.json';
    this.PACKAGE_JSON_FILE = 'package.json';
    this.README_FILE = 'README.md';
    this.STORYBOOK_FILE = '.storybook/main.js';
    this.PATH = !this.IS_TEST_ENV ? this.setPathLocation() : '..';
    // TODO: pipeline test fails attempting to look for dynamic file path
    this.FILES_PATH = `${this.PATH}/files`;
    this.project = { directory: program.args[0], name: program.args[0] };
    this.isNode = false;
    this.isReact = false;
    this.eslint = {};
    this.jsTsConfig = { compilerOptions: {}, exclude: [], include: [], ignore: [] };
    this.json = {};
    this.readme = '';
    this.name = {};
    this.checkmark = chalk.green.bold('✓');

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
        default: true,
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
        name: 'optOutTelemetry',
        message: `Do you want to opt out of Storybook's usage telemetry? \n${chalk.dim(
          'https://storybook.js.org/docs/react/configure/telemetry'
        )}`,
        default: true,
        when: answers => answers.useStorybook,
      },
    ];

    /* istanbul ignore if */
    if (!this.IS_TEST_ENV) {
      this.run();
    }
  }

  async run() {
    await this.getProjectPreferencesFromUser();

    this.print('\n');
    this.print([
      '> Preparing to create your project using',
      chalk.bold('@dreamistlabs/dlabs-cli.'),
      '\n',
    ]);

    this.setupInitialProjectFiles();
    this.print([this.checkmark, 'Setup initial project files.']);

    this.updateBaseProjectConfigurations();
    this.print([this.checkmark, 'Update base project configurations.']);

    this.setupDreamistLabsFilesAndConfigurations();
    this.print([this.checkmark, `Setup ${pkg.name} files and configurations.`]);

    this.exportConfigurationsToFile();
    this.print([
      this.checkmark,
      `Export configurations to ${this.PACKAGE_JSON_FILE} and ${
        this.project.useTypeScript ? this.TSCONFIG_FILE : this.JSCONFIG_FILE
      }.`,
    ]);

    if (this.isNode) {
      /* istanbul ignore if  */
      if (this.isGitEnabled) {
        const { stdout } = shell.exec('git rev-parse --show-toplevel  --quiet');
        if (!stdout) {
          shell.exec('git init  --quiet');
          this.print([this.checkmark, 'Initialize a git repository.']);
        }
      }
    }

    /* istanbul ignore if  */
    if (!this.IS_TEST_ENV) {
      this.print('> Installing project dependencies using npm...');
      shell.exec('npm install --silent');
    }

    if (this.isGitEnabled) {
      const { stdout } = shell.exec('git rev-parse --quiet --show-toplevel');
      const checkGit = new RegExp(`^.+${this.project.name}$`).test(stdout);
      console.log('hello', stdout, new RegExp(`^.+${this.project.name}$`), checkGit);

      if (checkGit) {
        shell.exec('git add -q .');
        shell.exec(`git commit -q -m "Added: Initial project structure using ${pkg.name}"`);
        this.print([this.checkmark, 'Create git commit.']);
      }
    }

    shell.cd('..');

    this.print([
      this.checkmark,
      chalk.bold('Your project is now ready!'),
      'View the README.md file to learn more about the project architecture.',
    ]);
  }

  /**
   *
   * @returns
   */
  async getProjectPreferencesFromUser() {
    await this.prompt(this.USER_QUESTIONS)
      .then(userPreferences => {
        this.project = { ...this.project, ...userPreferences };
        this.isNode = this.project.type === 'node';
        this.isReact = this.REACT_PROJECT_TYPES.includes(this.project.type);
      })
      .catch(this.userPreferenceErrorHandler);

    return this;
  }

  /**
   *
   */
  setupInitialProjectFiles() {
    const { directory, useStorybook, useTypeScript, type } = this.project;

    // ignoring top-level isReact logic since it currently doesn't include anything
    // that isn't ignored by tests; will remove if this changes
    /* istanbul ignore if */
    if (this.isReact) {
      /* istanbul ignore if */
      if (!this.IS_TEST_ENV) {
        const includeTypeScript = useTypeScript ? ' --template typescript' : '';

        execInColor(`npx create-react-app ${directory}${includeTypeScript}`);

        this.navigateToTargetDirectory(directory);

        if (useStorybook) {
          execInColor('npx storybook init');

          // TODO: For TypeScript, may have to refer to: https://storybook.js.org/docs/react/configure/typescript

          // https://storybook.js.org/docs/react/configure/telemetry
          if (this.project.optOutTelemetry) {
            const fileContent = fs.readFileSync(this.STORYBOOK_FILE, 'utf8');
            const content = JSON.parse(fileContent.replace('module.exports = ', ''));

            content.core = { ...content.core, disableTelemetry: true };

            fs.writeFileSync(
              this.STORYBOOK_FILE,
              'module.exports = '.concat(JSON.stringify(content))
            );

            this.print([this.checkmark, "Opt out of Storybook's usage telemetry."]);
            this.print(`See ${this.project.name}/${this.STORYBOOK_FILE} for configuration`);
          }
        }
      }
    } else {
      const { directory } = this.project;

      // create directory if it doesn't exist
      if (!fs.existsSync(directory)) {
        shell.mkdir(directory);
        this.print([this.checkmark, `Setup project directory for ${this.project.name}.`]);
      }

      this.navigateToTargetDirectory(directory);

      const filename = this._formatNameInPascalCase();
      const nodeFiles = [`${this.FILES_PATH}/${type}/*`, `${this.FILES_PATH}/${type}/.*`];

      shell.cp('-R', nodeFiles, '.');

      replace.sync({ files: [`src/**/*.js`], from: /Placeholder/g, to: filename });
      shell.mv(`src/lib/Placeholder.js`, `src/lib/${filename}.js`);

      if (useTypeScript) {
        shell.mv('src/index.js', 'src/index.ts');
        shell.mv(`src/lib/${filename}.js`, `src/lib/${filename}.ts`);
      }
    }

    return this;
  }

  // Add base configurations based on project type
  updateBaseProjectConfigurations() {
    if (this.isNode) {
      const {
        json: { babel, dependencies, devDependencies, jest, scripts, template },
        jsconfig,
      } = NODE.base;
      const {
        json: {
          babel: babelTS,
          dependencies: dependenciesTS,
          devDependencies: devDependenciesTS,
          scripts: scriptsTS,
        },
        tsconfig,
      } = NODE_TS.base;

      this.json = template;
      this.updatePackageJson('babel', babel);
      this.updatePackageJson('dependencies', dependencies);
      this.updatePackageJson('devDependencies', devDependencies);
      this.updatePackageJson('jest', jest);
      this.updatePackageJson('scripts', scripts);

      this.jsTsConfig = jsconfig;

      if (this.project.useTypeScript) {
        this.json.babel = {
          ...this.json.babel,
          presets: this.json.babel.presets.concat(babelTS.presets),
        };

        this.updatePackageJson('dependencies', dependenciesTS);
        this.updatePackageJson('devDependencies', devDependenciesTS);
        this.updatePackageJson('scripts', scriptsTS);

        this.jsTsConfig = {
          ...this.jsTsConfig,
          compilerOptions: {
            ...this.jsTsConfig.compilerOptions,
            ...tsconfig.compilerOptions,
          },
        };
      }
    } else if (this.isReact) {
      this.json = this.readFileContents('JSON', this.PACKAGE_JSON_FILE);

      const {
        json: { babel, eslintConfig, jest },
        jsconfig,
      } = REACT.base;

      // Load from file for TypeScript, otherwise init from configuration
      this.jsTsConfig = this.project.useTypeScript
        ? this.readFileContents('JSON', this.TSCONFIG_FILE)
        : jsconfig;

      this.updatePackageJson('babel', babel);
      this.updatePackageJson('eslintConfig', eslintConfig);
      this.updatePackageJson('jest', jest);

      if (this.project.useTypeScript) {
        const { tsconfig: compilerOptions, exclude, ignore } = REACT_TS.base;

        this.jsTsConfig.compilerOptions = {
          ...this.jsTsConfig.compilerOptions,
          ...compilerOptions,
        };
        this.jsTsConfig.exclude = exclude;
        this.jsTsConfig.ignore = ignore;
      }
    }

    return this;
  }

  /**
   * Setup common dependencies, scripts and files that should be included
   * by default based on the project type by default. This includes files
   * like gitignore, auto-changelog, cloc, vscode configurations; dependencies
   * like
   * @param {*} path
   */
  setupDreamistLabsFilesAndConfigurations() {
    const {
      devDependencies,
      scripts,
      'auto-changelog': autoChangelog,
      eslintConfig,
      jest,
      prettier,
    } = DLABS.base.json;

    shell.cp('-R', [`${this.FILES_PATH}/dlabs/*`, `${this.FILES_PATH}/dlabs/.*`], '.');

    this.updatePackageJson('devDependencies', devDependencies);
    this.updatePackageJson('scripts', scripts);
    this.updatePackageJson('auto-changelog', autoChangelog);
    this.updatePackageJson('jest', jest);
    this.updatePackageJson('prettier', prettier);

    this.json.eslintConfig = {
      ...this.json.eslintConfig,
      extends: this.json.eslintConfig.extends.concat(eslintConfig.extends),
      parserOptions: eslintConfig.parserOptions,
      plugins: this.json.eslintConfig.plugins.concat(eslintConfig.plugins),
      rules: {
        ...this.json.eslintConfig.rules,
        ...eslintConfig.rules,
      },
      settings: {
        ...this.json.eslintConfig.settings,
        ...eslintConfig.settings,
      },
    };

    // TODO: Maybe always copy README? Dynamically inject more info into README
    if (!this.isReact) {
      replace.sync({
        files: [this.README_FILE],
        from: /placeholder/g,
        to: this.project.name,
      });
    } else {
      // TODO override create-react-app readme for isReact projects?
    }

    if (this.isNode) {
      replace.sync({
        files: 'src/index.test.js',
        from: /Placeholder/g,
        to: this._formatNameInPascalCase(),
      });

      if (this.project.useTypeScript) {
        const { devDependencies, eslintConfig, jest } = NODE_TS.dlabs.json;
        shell.mv('src/index.test.js', 'src/index.test.ts');

        this.updatePackageJson('devDependencies', devDependencies);
        this.updatePackageJson('jest', jest);

        this.json.eslintConfig = {
          ...this.json.eslintConfig,
          extends: this.json.eslintConfig.extends.concat(eslintConfig.extends),
          parser: eslintConfig.parser,
          parserOptions: {
            ...this.json.eslintConfig.parserOptions,
            project: eslintConfig.parserOptions.project,
          },
          plugins: this.json.eslintConfig.plugins.concat(eslintConfig.plugins),
        };
      }
    } else if (this.isReact) {
      const { dependencies, devDependencies, eslintConfig } = REACT.dlabs.json;

      this.updatePackageJson('dependencies', dependencies);
      this.updatePackageJson('devDependencies', devDependencies);

      this.json.eslintConfig = {
        ...this.json.eslintConfig,
        extends: this.json.eslintConfig.extends.concat(eslintConfig.extends),
        parserOptions: {
          ...this.json.eslintConfig.parserOptions,
          ecmaFeatures: {
            ...this.json.eslintConfig.parserOptions.ecmaFeatures,
            ...eslintConfig.parserOptions.ecmaFeatures,
          },
        },
        plugins: this.json.eslintConfig.plugins.concat(eslintConfig.plugins),
        settings: {
          ...this.json.eslintConfig.settings,
          ...eslintConfig.settings,
        },
      };

      if (this.project.useTypeScript) {
        const { devDependencies, eslintConfig } = REACT_TS.dlabs.json;

        this.updatePackageJson('devDependencies', devDependencies);

        this.json.eslintConfig = {
          ...this.json.eslintConfig,
          extends: this.json.eslintConfig.extends.concat(eslintConfig.extends),
          parser: eslintConfig.parser,
          parserOptions: {
            ...this.json.eslintConfig.parserOptions,
            project: eslintConfig.parserOptions.project,
          },
          plugins: this.json.eslintConfig.plugins.concat(eslintConfig.plugins),
        };
      }
    }

    // this current overrides any methods before this that also updates this.readme (projectFiles)
    // this.readme = this.readFileContents('README', this.README_FILE);

    return this;
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

  navigateToTargetDirectory(directory) {
    let isInTargetDirectory = shell.pwd().stdout.includes(directory);

    // try to navigate to directory if not already in it.
    if (!isInTargetDirectory) {
      shell.cd(directory);
      isInTargetDirectory = shell.pwd().stdout.includes(directory);
    }

    // if it's still not in target directory, exit process
    if (!isInTargetDirectory) {
      const errMessage = "Sorry, we couldn't find or access the target directory:";
      this.print(chalk.red(`${errMessage} ${this.project.name}`));
      throw new DLError(`${errMessage} ${this.project.name}`);
    }

    return this;
  }

  /**
   *
   * @returns
   */
  exportConfigurationsToFile() {
    this.json = preparePackageJsonForExport(this.json);

    // Rewrite updated this.json content to package.json file.
    this.writeContentsToFile('JSON', this.PACKAGE_JSON_FILE, this.json);

    // Rewrite updated this.jsconfig content to jsconfig.json file.
    const filename = this.project.useTypeScript ? this.TSCONFIG_FILE : this.JSCONFIG_FILE;
    this.writeContentsToFile('JSON', filename, this.jsTsConfig);

    // Rewrite updated this.readme content to README.md file.
    // this.writeContentsToFile('README', this.README_FILE, this.readme);

    return this;
  }

  // LOCATION finds the user's root folder where dlabs-cli is installed.
  // PATH adds the FILES_PATH to dlabs-cli's module files.
  setPathLocation() {
    // TODO need better way to differentiate between macOS and Windows FILES_PATHs
    let dlabsPkgLocation = shell.which('dlabs-cli') || shell.which('dlabs');
    let dlabsLocation = dlabsPkgLocation?.stdout?.trim();

    /* istanbul ignore if */
    if (dlabsLocation?.[0] === '/') {
      dlabsLocation = dlabsLocation.replace(/(\/bin\/dlabs-cli)/, '');
      return `${dlabsLocation}/lib/node_modules/@dreamistlabs/dlabs-cli`;
    } else if (dlabsLocation?.includes('C:')) {
      dlabsLocation = dlabsLocation.replace(/\\DLABS-CLI.CMD/, '').replace(/\\\\/g, '\\');
      return `${dlabsLocation.toLowerCase()}\\node_modules\\dlabs-cli`;
    } else {
      const errMessage = `Unable to find ${pkg.name} package location. This is an error with ${pkg.name}, please open an issue on GitHub.`;
      this.print(chalk.red(errMessage));
      this.print(pkg.bugs.url);
      throw new DLError(errMessage);
    }
  }

  /**
   *
   * @param {*} key
   * @param {*} value
   */
  updatePackageJson(key, value) {
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
    const content = this.readFileContents('README', `${this.FILES_PATH}/readme/${filename}.md`);

    this.readme = this.readme.concat(`\n\n${content}`);
  }

  userPreferenceErrorHandler(error) {
    const errMessage =
      'An error occurred related to the user prompt interface. Please open an issue on GitHub.';
    this.print(chalk.red(error?.message || errMessage));
    this.print(pkg.bugs.url);
    throw new DLError(error?.message || errMessage);
  }

  readFileContents(type = 'JSON', fileLocation) {
    return type === 'JSON'
      ? JSON.parse(fs.readFileSync(fileLocation, 'utf-8'))
      : fs.readFileSync(fileLocation, 'utf8');
  }

  writeContentsToFile(type = 'JSON', fileLocation, fileContent) {
    const content = type === 'JSON' ? JSON.stringify(fileContent, null, 2) : fileContent;

    fs.writeFileSync(fileLocation, content);
  }

  print(message) {
    if (!message) return;

    /* istanbul ignore next */
    if (!this.IS_TEST_ENV) {
      const output = chalk.hex('#0C4C74');

      if (Array.isArray(message)) {
        shell.echo(output.apply(null, message));
      } else {
        shell.echo(output(message));
      }
    }

    shell.exec('sleep 1');
  }
}
