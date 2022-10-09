import shell from 'shelljs';
import fs from 'fs';
import ProjectCreator from '../src/lib/ProjectCreator';
import { COMMON, CONTINUOUS_INTEGRATION, NODE, QUALITY, TEST } from '../src/lib/configurations';

const EXPECTED = {
  PASCAL_CASE_PROJECT_NAME: 'ProjectTester',
  TEST_FILE_PATH: 'src/index.test.js',
  TEST_PROJECT: 'test-in-progress',
};

const REACT_PACKAGE_JSON = `
{
  "name": "placeholder",
  "version": "0.0.1",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.3.0",
    "@testing-library/user-event": "^13.5.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
`;

const program = { args: [EXPECTED.TEST_PROJECT] };

// creates a list of files from searching the given file path location
const getExpectedFilesList = (filePathLocation, folderPath, replacers) => {
  let expectedFiles = shell.ls('-AR', [filePathLocation]);

  const replaceItem = (itemtoReplace, replaceWith = undefined) => {
    const index = expectedFiles.indexOf(itemtoReplace);

    if (index > -1) {
      if (replaceWith) {
        expectedFiles.splice(index, 1, replaceWith);
      } else {
        expectedFiles.splice(index, 1);
      }
    }
  };

  if (Array.isArray(folderPath)) {
    folderPath.forEach(itemPath => replaceItem(itemPath));
  } else if (typeof folderPath === 'string') {
    replaceItem(folderPath);
  }

  if (typeof replacers === 'object' && Object.keys(replacers).length > 0) {
    Object.keys(replacers).forEach(keyToReplace => {
      replaceItem(keyToReplace, replacers[keyToReplace]);
    });
  }

  return expectedFiles.map(file => [file]);
};

const getExpectedObjectShape = objectList => {
  const expectedObject = Object.keys(objectList).reduce(
    (acc, curr) => ({ ...acc, [curr]: expect.anything() }),
    {}
  );

  return expect.objectContaining(expectedObject);
};

describe('ProjectCreator', () => {
  let originalShellSilentState = shell.config.silent;
  let originalDirectory;

  // clean up: navigate back to working directory and remove.
  const cleanupAndResetAfterTests = () => {
    // return to root folder and remove test project folder.
    shell.cd(originalDirectory);
    shell.rm('-rf', EXPECTED.TEST_PROJECT);
  };

  beforeAll(() => {
    shell.config.silent = true;
    originalDirectory = `${shell.pwd().stdout}/test`;

    cleanupAndResetAfterTests();
  });

  afterAll(() => {
    shell.config.silent = originalShellSilentState; // restore original shell silent state
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('> Initialization', () => {
    let module;
    beforeAll(() => (module = new ProjectCreator(program)));
    afterAll(() => (module = undefined));

    test('Should be an instance of ProjectCreator', () => {
      expect(module).toBeInstanceOf(ProjectCreator);
    });

    test('Should contain the expected initial values', () => {
      expect(module.REACT_PROJECT_TYPES).toEqual(['react', 'react-component']);
      expect(module.BABEL_CONFIG_FILE).toEqual('babel.config.json');
      expect(module.ESLINT_FILE).toEqual('.eslintrc.json');
      expect(module.JSCONFIG_FILE).toEqual('jsconfig.json');
      expect(module.TSCONFIG_FILE).toEqual('tsconfig.json');
      expect(module.PACKAGE_JSON_FILE).toEqual('package.json');
      expect(module.README_FILE).toEqual('README.md');
      expect(module.babelConfig).toEqual({ presets: [] });
      expect(module.eslint).toEqual({});
      expect(module.jsConfig).toEqual({
        compilerOptions: {},
        exclude: [],
        include: [],
        ignore: [],
      });
      expect(module.json).toEqual({});
      expect(module.readme).toEqual('');
    });

    test('Should conditionally render user prompt questions based on user answers', () => {
      const useStorybook = module.USER_QUESTIONS.find(({ name }) => name === 'useStorybook');
      const useQuality = module.USER_QUESTIONS.find(({ name }) => name === 'useQuality');
      const useCICD = module.USER_QUESTIONS.find(({ name }) => name === 'useCICD');
      const useTesting = module.USER_QUESTIONS.find(({ name }) => name === 'useTesting');

      expect(useStorybook.when({ type: 'node' })).toEqual(false);
      expect(useStorybook.when({ type: 'react-component' })).toEqual(true);
      expect(useStorybook.when({ type: 'react' })).toEqual(true);

      expect(useQuality.when({ useDefaults: true })).toEqual(false);
      expect(useQuality.when({ useDefaults: false })).toEqual(true);

      expect(useCICD.when({ useDefaults: true })).toEqual(false);
      expect(useCICD.when({ useDefaults: false })).toEqual(true);

      expect(useTesting.when({ type: 'node', useDefaults: false })).toEqual(true);
      expect(useTesting.when({ type: 'react', useDefaults: false })).toEqual(false);
      expect(useTesting.when({ type: 'node', useDefaults: true })).toEqual(false);
    });

    test('Should throw DLError if no program is provided', () => {
      expect(() => new ProjectCreator(undefined)).toThrowError(/No program detected/);
    });
  });

  describe('> Helper Methods', () => {
    let module;

    beforeAll(async () => {
      module = new ProjectCreator(program);
      module.USER_QUESTIONS = [
        { name: 'type', value: 'node' },
        { name: 'useTypeScript', value: false },
        { name: 'useStorybook', value: false },
        { name: 'useDefaults', value: true },
      ];
      await module._getProjectPreferences();
      module._setupFolderDirectory();
    });
    beforeEach(() => shell.cd(originalDirectory)); // return to root folder
    afterAll(cleanupAndResetAfterTests);

    describe('> #_output', () => {
      test('Should perform a shell.exec command if the output type is not an error', () => {
        const execSpy = jest.spyOn(shell, 'exec');
        module._output('info', 'message');

        expect(execSpy).toHaveBeenCalled();
      });
      test('Should throw an error if the output type is an error', () => {
        expect(() => module._output('error', 'message')).toThrow();
      });
    });

    describe('> #_formatNameInPascalCase', () => {
      test(`Should provide the PascalCase formatted version of the string ${EXPECTED.TEST_PROJECT}`, () => {
        const result = module._formatNameInPascalCase();
        expect(result).toBe('ProjectTester');
      });
    });

    describe('> #_getProjectPreferences', () => {
      test('Should capture default user preferences from inquirer prompt [mocked]', async () => {
        await module._getProjectPreferences();

        expect(module.project.directory).toEqual(EXPECTED.TEST_PROJECT);
        expect(module.project.name).toEqual(EXPECTED.TEST_PROJECT);
        expect(module.project.type).toEqual('node');
        expect(module.project.useTypeScript).toEqual(false);
        expect(module.isReact).toEqual(false);
      });
    });

    describe('> #_initializeGit', () => {
      test('Should run and trigger console/log messages', () => {
        const spy = jest.spyOn(ProjectCreator.prototype, '_output');
        const whichSpy = jest.spyOn(shell, 'which');
        module._initializeGit();

        expect(whichSpy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
      });

      test('Should not run or trigger console/log messages, if git is not detected', () => {
        const whichSpy = jest.spyOn(shell, 'which').mockImplementation(() => false);
        const spy = jest.spyOn(ProjectCreator.prototype, '_output');

        module._initializeGit();

        expect(whichSpy).toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
      });
    });
    describe('> #_installNPMPackages', () => {
      test('Should run and trigger console/log messages', () => {
        const spy = jest.spyOn(ProjectCreator.prototype, '_output');
        module._installNPMPackages();

        expect(spy).toHaveBeenCalled();
      });
    });

    describe('> #_isInTargetDirectory', () => {
      test(`Should return false when current directory isn't the target [${EXPECTED.TEST_PROJECT}] directory`, () => {
        const result = module._isInTargetDirectory(EXPECTED.TEST_PROJECT);

        expect(result).toBe(false);
      });

      test(`Should return true when current directory is the target [${EXPECTED.TEST_PROJECT}] directory`, async () => {
        shell.cd(EXPECTED.TEST_PROJECT);
        const result = module._isInTargetDirectory(EXPECTED.TEST_PROJECT);

        expect(result).toBe(true);
      });
    });

    describe('> #_loadFileContents', () => {
      beforeEach(() => shell.cd(EXPECTED.TEST_PROJECT));

      test('Should load the content from the provided JSON file be default', () => {
        const testFile = '_loadFileContentsDefault.json';
        const content = { name: 'temporary' };

        shell.touch(testFile);
        fs.writeFileSync(testFile, JSON.stringify(content, null, 2));

        const loadedContent = module._loadFileContents(undefined, testFile);
        expect(loadedContent).toEqual(content);

        shell.rm('-rf', testFile);
      });

      test('Should load the content from the provided JSON file', () => {
        const testFile = '_loadFileContents.json';
        const content = { name: 'temporary' };

        shell.touch(testFile);
        fs.writeFileSync(testFile, JSON.stringify(content, null, 2));

        const loadedContent = module._loadFileContents('JSON', testFile);
        expect(loadedContent).toEqual(content);

        shell.rm('-rf', testFile);
      });

      test('Should load the content from the provided README file', () => {
        const testFile = '_loadFileContents.md';
        const content = '# Custom Title';

        shell.touch(testFile);
        fs.writeFileSync(testFile, content);

        const loadedContent = module._loadFileContents('README', testFile);
        expect(loadedContent).toEqual(content);

        shell.rm('-rf', testFile);
      });
    });

    describe('> #_navigateToTargetDirectory', () => {
      test(`Should navigate to project directory [${EXPECTED.TEST_PROJECT}] successfully`, () => {
        module._navigateToTargetDirectory(EXPECTED.TEST_PROJECT);

        expect(shell.pwd().stdout).toContain(EXPECTED.TEST_PROJECT);
      });

      test(`Should throw an error if the project directory [${EXPECTED.TEST_PROJECT}] is not empty`, () => {
        shell.touch(`${EXPECTED.TEST_PROJECT}/temporaryFile.json`);

        expect(() => module._navigateToTargetDirectory(EXPECTED.TEST_PROJECT)).toThrowError(
          /directory is not empty/
        );
      });

      test(`Should throw an error when failing to navigate to project directory [${EXPECTED.TEST_PROJECT}]`, () => {
        shell.cd('..');

        expect(() => module._navigateToTargetDirectory(EXPECTED.TEST_PROJECT)).toThrowError(
          /couldn\'t find or access/
        );
      });

      test(`Should throw an error when project directory [${EXPECTED.TEST_PROJECT}] is not empty`, () => {
        shell.cp('.clocignore', EXPECTED.TEST_PROJECT); // copy file to directory so it's not empty

        expect(() => module._navigateToTargetDirectory(EXPECTED.TEST_PROJECT)).toThrowError(
          /not empty/
        );
      });
    });

    describe('> #_rewriteModifiedContentToFiles', () => {});

    describe('> #_setupFolderDirectory', () => {
      test(`Should create a new directory based on project name: ${EXPECTED.TEST_PROJECT}`, () => {
        expect(shell.test('-d', EXPECTED.TEST_PROJECT)).toBeTruthy();
      });

      // test(`Should create a new directory based on project name: ${EXPECTED.TEST_PROJECT}`, () => {
      //   const spy = jest.spyOn(ProjectCreator.prototype, '_output');
      //   module.project.directory = '.';
      //   module._setupFolderDirectory();

      //   expect(spy).toHaveBeenCalled();
      // });
    });

    describe('> #_setPathLocation', () => {
      test('Should return the expected path location for paths beginning with "/"', () => {
        jest.spyOn(shell, 'which').mockImplementation(() => ({
          stdout: ' /User ', // TODO: Update with an actual example of Mac file path
        }));

        const result = module._setPathLocation();

        expect(result).toEqual(
          expect.stringContaining('/lib/node_modules/@dreamistlabs/dlabs-cli')
        );
      });

      test('Should return the expected path location for paths beginning with "C:"', () => {
        jest.spyOn(shell, 'which').mockImplementation(() => ({
          stdout: 'C:\\USERS\\SOMEUSER\\DLABS-CLI.CMD',
        }));

        const result = module._setPathLocation();

        expect(result).toEqual(expect.stringContaining('\\node_modules\\dlabs-cli'));
      });

      test('Should throw an error if unable to determine file path of dlabs-cli package location', () => {
        jest.spyOn(shell, 'which').mockImplementation(() => ({
          stdout: 'UNKNOWN',
        }));

        expect(() => module._setPathLocation()).toThrowError(
          /(Unable to find).*(package location)/
        );
      });
    });

    describe('> #_sortEntries', () => {
      test('Should alphabetically sort provided object and return it', () => {
        const result = module._sortEntries({ zlast: 'world', TFirst: 'hello', bMiddle: '(uh oh)' });
        expect(result).toEqual({ TFirst: 'hello', bMiddle: '(uh oh)', zlast: 'world' });
      });
    });

    describe('> #_verifyPackageJson', () => {
      beforeEach(() => shell.cd(EXPECTED.TEST_PROJECT));

      test("Should throw an error if there's no package.json file in project directory", () => {
        expect(() => module._verifyPackageJson()).toThrowError(/No package.json detected/);
      });
    });

    describe('> #_updatePackageFile', () => {
      test("Should create a new property in the module's json property, if it doesn't exist", () => {
        expect(module.json).not.toHaveProperty('newKey');

        module._updatePackageFile('newKey', 'newContent');

        expect(module.json).toHaveProperty('newKey');
      });
      test("Should update an existing property in the module's json property [string]", () => {
        module._updatePackageFile('anotherNewKey', 'withNewerContent');

        expect(module.json).toHaveProperty('anotherNewKey');

        module._updatePackageFile('anotherNewKey', 'withEvenNewerContent');

        expect(module.json.anotherNewKey).toEqual('withEvenNewerContent');
      });

      test("Should update an existing property in the module's json property [object]", () => {
        const newContent = { newKey: 'withNewContent' };
        const newerContent = { newerKey: 'withNewerContent' };
        module._updatePackageFile('newProp', newContent);

        expect(module.json.newProp).toEqual(expect.objectContaining(newContent));

        module._updatePackageFile('newProp', newerContent);

        expect(module.json.newProp).toEqual(expect.objectContaining(newerContent));
      });
    });

    describe('> #_updateReadMeContent', () => {});

    describe('> #_userPreferenceErrorHandler', () => {
      test('Should throw an error with the provided error message', () => {
        expect(() =>
          module._userPreferenceErrorHandler({ message: 'my custom error' })
        ).toThrowError(/my custom error/);
      });
      test('Should throw an error the default error message', () => {
        expect(() => module._userPreferenceErrorHandler()).toThrowError(
          /error occurred related to the user prompt interface/
        );
      });
    });

    describe('> #_writeContentsToFile', () => {
      beforeEach(() => shell.cd(EXPECTED.TEST_PROJECT));

      test('Should write provided content to JSON file by default', () => {
        const testFile = '_writeContentsToFileDefault.json';
        const content = { name: 'temporary' };

        shell.touch(testFile);
        module._writeContentsToFile(undefined, testFile, content);

        const loadedContent = JSON.parse(fs.readFileSync(testFile, 'utf-8'));
        expect(loadedContent).toEqual(content);

        shell.rm('-rf', testFile);
      });
      test('Should write provided content to JSON file', () => {
        const testFile = '_writeContentsToFile.json';
        const content = { name: 'temporary' };

        shell.touch(testFile);
        module._writeContentsToFile('JSON', testFile, content);

        const loadedContent = JSON.parse(fs.readFileSync(testFile, 'utf-8'));
        expect(loadedContent).toEqual(content);

        shell.rm('-rf', testFile);
      });

      test('Should write provided content to README file', () => {
        const testFile = '_writeContentsToFile.md';
        const content = '# Custom Title';

        shell.touch(testFile);
        module._writeContentsToFile('README', testFile, content);

        const loadedContent = fs.readFileSync(testFile, 'utf8');
        expect(loadedContent).toEqual(content);

        shell.rm('-rf', testFile);
      });
    });
  });

  describe('> Project Type: Node [with Default Options]', () => {
    let module;

    beforeAll(async () => {
      module = new ProjectCreator(program);
      module.USER_QUESTIONS = [
        { name: 'type', value: 'node' },
        { name: 'useTypeScript', value: false },
        { name: 'useStorybook', value: false },
        { name: 'useDefaults', value: true },
      ];
      await module._getProjectPreferences();
    });

    afterAll(cleanupAndResetAfterTests);

    describe('> #_setupProjectFiles', () => {
      beforeAll(() => module._setupProjectFiles());

      const expectedFiles = getExpectedFilesList('./files/node', ['src', 'src/lib'], {
        'src/lib/Placeholder.js': 'src/lib/ProjectTester.js',
      });

      test('Should assign contents of "babel.config.json" to module', () => {
        expect(Object.keys(module.babelConfig).length === 0).toBe(false);
      });

      test('Should assign contents of "jsconfig.json" to module', () => {
        expect(Object.keys(module.jsConfig).length === 0).toBe(false);
      });

      test('Should assign contents of "package.json" to module', () => {
        expect(Object.keys(module.jsConfig).length === 0).toBe(false);
      });

      test.each(expectedFiles)(
        'Should copy expected file "%s" to project directory successfully',
        expectedFile => expect(shell.test('-f', expectedFile)).toBeTruthy()
      );

      test('Should update package.json\'s "name" property', () => {
        expect(module.json.name).toEqual(EXPECTED.TEST_PROJECT);
      });

      test('Should update package.json\'s "devDependencies" property', () => {
        const expected = getExpectedObjectShape(NODE.BASE.DEV_DEPENDENCIES);

        expect(module.json.devDependencies).toEqual(expected);
      });

      test('Should update package.json\'s "scripts" property', () => {
        const expected = getExpectedObjectShape(NODE.BASE.SCRIPTS);

        expect(module.json.scripts).toEqual(expected);
      });
    });

    describe('> #_setupCommonFiles', () => {
      beforeAll(() => module._setupCommonFiles());
      const expectedFiles = getExpectedFilesList('./files/common', '.vscode');

      test('Should assign contents of "README" to module', () => {
        expect(module.readme).toContain(`# ${EXPECTED.TEST_PROJECT}`);
      });

      test.each(expectedFiles)(
        'Should copy expected file "%s" to project directory successfully',
        expectedFile => expect(shell.test('-f', expectedFile)).toBeTruthy()
      );

      test(`Should replaces Placeholder text in README.md with ${EXPECTED.TEST_PROJECT}`, () => {
        const fileContent = shell.cat('README.md').stdout;
        const expectedContent = `# ${EXPECTED.TEST_PROJECT}`;

        expect(fileContent).toContain(expectedContent);
      });

      test('Should update package.json\'s "devDependencies" property', () => {
        const expected = getExpectedObjectShape(COMMON.DEV_DEPENDENCIES);

        expect(module.json.devDependencies).toEqual(expected);
      });

      test('Should update package.json\'s "scripts" property', () => {
        const expected = getExpectedObjectShape(COMMON.SCRIPTS);

        expect(module.json.scripts).toEqual(expected);
      });
    });

    describe('> #_setupQualityFiles', () => {
      beforeAll(() => module._setupQualityFiles());
      const expectedFiles = getExpectedFilesList('./files/quality', ['.husky', '.husky/_']);

      test.each(expectedFiles)(
        'Should copy expected file "%s" to project directory successfully',
        expectedFile => expect(shell.test('-f', expectedFile)).toBeTruthy()
      );

      test('Should update package.json\'s "devDependencies" property', () => {
        const expected = getExpectedObjectShape(QUALITY.BASE.DEV_DEPENDENCIES);

        expect(module.json.devDependencies).toEqual(expected);
      });

      test('Should update package.json\'s "scripts" property', () => {
        const expected = getExpectedObjectShape(QUALITY.BASE.SCRIPTS);

        expect(module.json.scripts).toEqual(expected);
      });
    });

    describe('> #_setupContinuousIntegrationFiles', () => {
      beforeAll(() => module._setupContinuousIntegrationFiles());
      const expectedFiles = getExpectedFilesList('./files/cicd', ['.github', '.github/workflows']);

      test.each(expectedFiles)(
        'Should copy expected file "%s" to project directory successfully',
        expectedFile => expect(shell.test('-f', expectedFile)).toBeTruthy()
      );
    });

    describe('> #_setupTestFiles', () => {
      beforeAll(() => module._setupTestFiles());
      const { PASCAL_CASE_PROJECT_NAME, TEST_FILE_PATH } = EXPECTED;

      const expectedFiles = getExpectedFilesList('./files/test', '__mocks__', {
        'index.test.js': TEST_FILE_PATH,
      });

      test('Should add the "jest" property to the package.json', () => {
        const expected = getExpectedObjectShape(TEST.BASE.CONFIG);

        expect(module.json).toHaveProperty('jest');
        expect(module.json.jest).toEqual(expected);
      });

      test.each(expectedFiles)(
        'Should copy expected file "%s" to project directory successfully',
        expectedFile => expect(shell.test('-f', expectedFile)).toBeTruthy()
      );

      test('Should extend eslint\'s "extends" property', () => {
        const expected = expect.arrayContaining(TEST.BASE.EXTENDS);

        expect(module.eslint.extends).toEqual(expected);
      });

      test('Should extend eslint\'s "plugins" property', () => {
        const expected = expect.arrayContaining(TEST.BASE.PLUGINS);

        expect(module.eslint.plugins).toEqual(expected);
      });

      test('Should extend eslint\'s "rules" property', () => {
        const expected = expect.objectContaining(TEST.BASE.RULES);

        expect(module.eslint.rules).toEqual(expected);
      });

      test('Should extend eslint\'s "settings" property', () => {
        const expected = expect.objectContaining(TEST.BASE.SETTINGS);

        expect(module.eslint.settings).toEqual(expected);
      });

      test(`Should replaces Placeholder text in ${TEST_FILE_PATH} with ${PASCAL_CASE_PROJECT_NAME}`, () => {
        const fileContent = shell.cat(TEST_FILE_PATH).stdout;
        const expectedContent = `import ${PASCAL_CASE_PROJECT_NAME} from './lib/${PASCAL_CASE_PROJECT_NAME}'`;

        expect(fileContent).toContain(expectedContent);
      });

      test('Should update package.json\'s "devDependencies" property', () => {
        const expected = getExpectedObjectShape(TEST.BASE.DEV_DEPENDENCIES);

        expect(module.json.devDependencies).toEqual(expected);
      });

      test('Should update package.json\'s "scripts" property', () => {
        const expected = getExpectedObjectShape(TEST.BASE.SCRIPTS);

        expect(module.json.scripts).toEqual(expected);
      });
    });
  });

  describe('> Project Type: Node [without Default Options]', () => {
    let module;
    beforeAll(async () => {
      module = new ProjectCreator(program);
      module.USER_QUESTIONS = [
        { name: 'type', value: 'node' },
        { name: 'useTypeScript', value: false },
        { name: 'useStorybook', value: false },
        { name: 'useDefaults', value: false },
        { name: 'useQuality', value: false },
        { name: 'useCICD', value: false },
        { name: 'useTesting', value: false },
      ];
      await module._getProjectPreferences();

      module._setupProjectFiles()._verifyPackageJson()._setupCommonFiles()._setupQualityFiles();
    });

    afterAll(cleanupAndResetAfterTests);

    describe('> #_setupQualityFiles', () => {
      beforeAll(() => module._setupQualityFiles());
      const expectedFiles = getExpectedFilesList('./files/quality', ['.husky', '.husky/_']);

      test.each(expectedFiles)(
        'Should not copy expected file "%s" to project directory',
        expectedFile => expect(shell.test('-f', expectedFile)).toBeFalsy()
      );

      test('Should not update package.json\'s "devDependencies" property', () => {
        const expected = getExpectedObjectShape(QUALITY.BASE.DEV_DEPENDENCIES);

        expect(module.json.devDependencies).not.toEqual(expected);
      });

      test('Should not update package.json\'s "scripts" property', () => {
        const expected = getExpectedObjectShape(QUALITY.BASE.SCRIPTS);

        expect(module.json.scripts).not.toEqual(expected);
      });
    });

    describe('> #_setupContinuousIntegrationFiles', () => {
      beforeAll(() => module._setupContinuousIntegrationFiles());
      const expectedFiles = getExpectedFilesList('./files/cicd', ['.github', '.github/workflows']);

      test.each(expectedFiles)(
        'Should not copy expected file "%s" to project directory',
        expectedFile => expect(shell.test('-f', expectedFile)).toBeFalsy()
      );
    });

    describe('> #_setupTestFiles', () => {
      beforeAll(() => module._setupTestFiles());
      const { PASCAL_CASE_PROJECT_NAME, TEST_FILE_PATH } = EXPECTED;

      const expectedFiles = getExpectedFilesList('./files/test', '__mocks__', {
        'index.test.js': TEST_FILE_PATH,
      });

      test('Should not add the "jest" property to the package.json', () => {
        expect(module.json).not.toHaveProperty('jest');
      });

      test.each(expectedFiles)(
        'Should not copy expected file "%s" to project directory successfully',
        expectedFile => expect(shell.test('-f', expectedFile)).toBeFalsy()
      );

      test('Should not extend eslint\'s "extends" property', () => {
        const expected = expect.arrayContaining(TEST.BASE.EXTENDS);

        expect(module.eslint.extends).not.toEqual(expected);
      });

      test('Should not extend eslint\'s "plugins" property', () => {
        const expected = expect.arrayContaining(TEST.BASE.PLUGINS);

        expect(module.eslint.plugins).not.toEqual(expected);
      });

      test('Should not extend eslint\'s "rules" property', () => {
        const expected = expect.objectContaining(TEST.BASE.RULES);

        expect(module.eslint.rules).not.toEqual(expected);
      });

      test('Should not extend eslint\'s "settings" property', () => {
        const expected = expect.objectContaining(TEST.BASE.SETTINGS);

        expect(module.eslint.settings).not.toEqual(expected);
      });

      test('Should update package.json\'s "devDependencies" property', () => {
        const expected = getExpectedObjectShape(TEST.BASE.DEV_DEPENDENCIES);

        expect(module.json.devDependencies).not.toEqual(expected);
      });

      test('Should update package.json\'s "scripts" property', () => {
        const expected = getExpectedObjectShape(TEST.BASE.SCRIPTS);

        expect(module.json.scripts).not.toEqual(expected);
      });
    });
  });

  describe('> Project Type: React-Component [with Default Options]', () => {
    let module;

    beforeAll(async () => {
      module = new ProjectCreator(program);
      module.USER_QUESTIONS = [
        { name: 'type', value: 'react-component' },
        { name: 'useTypeScript', value: false },
        { name: 'useStorybook', value: false },
        { name: 'useDefaults', value: true },
      ];
      await module._getProjectPreferences();

      // Because we leverage create-react-app when creating React projects,
      // we skip calling module._setupProjectFiles() and instead manually
      // create the folder and insert the react package.json
      module._setupFolderDirectory()._navigateToTargetDirectory(EXPECTED.TEST_PROJECT);
      shell.ShellString(REACT_PACKAGE_JSON).to('package.json');
    });

    afterAll(cleanupAndResetAfterTests);

    describe('> #_setupQualityFiles', () => {
      beforeAll(() => {
        module._setupCommonFiles()._setupQualityFiles();
      });

      test('Should extend eslint\'s "extends" property', () => {
        const expected = expect.arrayContaining(QUALITY.REACT.EXTENDS);

        expect(module.eslint.extends).toEqual(expected);
      });

      test('Should extend eslint\'s "parser options" property', () => {
        const expected = expect.objectContaining(QUALITY.REACT.PARSER_OPTIONS);

        expect(module.eslint.parserOptions).toEqual(expected);
      });

      test('Should extend eslint\'s "plugins" property', () => {
        const expected = expect.arrayContaining(QUALITY.REACT.PLUGINS);

        expect(module.eslint.plugins).toEqual(expected);
      });

      test('Should extend eslint\'s "rules" property', () => {
        const expected = expect.objectContaining(QUALITY.REACT.RULES);

        expect(module.eslint.rules).toEqual(expected);
      });

      test('Should extend eslint\'s "settings" property', () => {
        const expected = expect.objectContaining(QUALITY.REACT.SETTINGS);

        expect(module.eslint.settings).toEqual(expected);
      });

      test('Should remove package.json\'s "eslintConfig" property', () => {
        expect(module.json.hasOwnProperty('eslintConfig')).toBe(false);
      });

      test('Should update package.json\'s "devDependencies" property', () => {
        const expected = getExpectedObjectShape(QUALITY.REACT.DEV_DEPENDENCIES);

        expect(module.json.devDependencies).toEqual(expected);
      });
    });

    describe('> #_setupTestFiles', () => {
      beforeAll(() => {
        module._setupTestFiles();
      });

      test('Should extend eslint\'s "extends" property', () => {
        const expected = expect.arrayContaining(TEST.REACT.EXTENDS);

        expect(module.eslint.extends).toEqual(expected);
      });

      test('Should extend eslint\'s "plugins" property', () => {
        const expected = expect.arrayContaining(TEST.REACT.PLUGINS);

        expect(module.eslint.plugins).toEqual(expected);
      });

      test('Should extend eslint\'s "rules" property', () => {
        const expected = expect.objectContaining(TEST.REACT.RULES);

        expect(module.eslint.rules).toEqual(expected);
      });

      test('Should update package.json\'s "jest" property', () => {
        const expectedExt = expect.arrayContaining(TEST.REACT.CONFIG.moduleFileExtensions);
        const expectedMapper = getExpectedObjectShape(TEST.REACT.CONFIG.moduleNameMapper);

        expect(module.json.jest.moduleFileExtensions).toEqual(expectedExt);
        expect(module.json.jest.moduleNameMapper).toEqual(expectedMapper);
      });

      test('Should update package.json\'s "dependencies" property', () => {
        const expected = getExpectedObjectShape(TEST.REACT.DEPENDENCIES);

        expect(module.json.dependencies).toEqual(expected);
      });

      test('Should update package.json\'s "devDependencies" property', () => {
        const expected = getExpectedObjectShape(TEST.REACT.DEV_DEPENDENCIES);

        expect(module.json.devDependencies).toEqual(expected);
      });
    });
  });

  describe('> Option: useStorybook = true', () => {});

  describe('> Option: useTypeScript = true', () => {
    let module;

    beforeAll(async () => {
      module = new ProjectCreator(program);
      module.USER_QUESTIONS = [
        { name: 'type', value: 'node' },
        { name: 'useTypeScript', value: true },
        { name: 'useStorybook', value: false },
        { name: 'useDefaults', value: true },
      ];
      await module._getProjectPreferences();
    });

    afterAll(cleanupAndResetAfterTests);

    describe('> #_setupProjectFiles', () => {
      beforeAll(() => module._setupProjectFiles());

      test('Should extend eslint\'s "parser options" property', () => {
        const expected = expect.objectContaining(NODE.TYPESCRIPT.PARSER_OPTIONS);

        expect(module.eslint.parserOptions).toEqual(expected);
      });

      test('Should rename "index.js" file to "index.ts"', () => {
        const expected = getExpectedObjectShape(TEST.TYPESCRIPT.DEV_DEPENDENCIES);

        expect(shell.test('-f', 'src/index.js')).toBeFalsy();
        expect(shell.test('-f', 'src/index.ts')).toBeTruthy();
      });

      test(`Should rename "${EXPECTED.PASCAL_CASE_PROJECT_NAME}.js" file to "${EXPECTED.PASCAL_CASE_PROJECT_NAME}.ts"`, () => {
        const expected = getExpectedObjectShape(TEST.TYPESCRIPT.DEV_DEPENDENCIES);

        expect(shell.test('-f', `src/lib/${EXPECTED.PASCAL_CASE_PROJECT_NAME}.js`)).toBeFalsy();
        expect(shell.test('-f', `src/lib/${EXPECTED.PASCAL_CASE_PROJECT_NAME}.ts`)).toBeTruthy();
      });

      test('Should update jsconfig.json\'s "compilerOptions" property', () => {
        const expected = getExpectedObjectShape(NODE.TYPESCRIPT.TSCONFIG.compilerOptions);

        expect(module.jsConfig.compilerOptions).toEqual(expected);
      });

      test('Should update package.json\'s "devDependencies" property', () => {
        const expected = getExpectedObjectShape(NODE.TYPESCRIPT.DEV_DEPENDENCIES);

        expect(module.json.devDependencies).toEqual(expected);
      });

      test('Should update package.json\'s "scripts" property', () => {
        const expected = getExpectedObjectShape(NODE.TYPESCRIPT.SCRIPTS);

        expect(module.json.scripts).toEqual(expected);
      });
    });

    describe('> #_setupQualityFiles', () => {
      beforeAll(() => module._setupQualityFiles());

      test('Should extend babelConfig\'s "presets" property', () => {
        const expected = expect.arrayContaining(QUALITY.TYPESCRIPT.PLUGINS);

        expect(module.eslint.plugins).toEqual(expected);
      });

      test('Should extend eslint\'s "extends" property', () => {
        const expected = expect.arrayContaining(QUALITY.TYPESCRIPT.BABEL.PRESETS);

        expect(module.babelConfig.presets).toEqual(expected);
      });

      test('Should extend eslint\'s "parser" property', () => {
        expect(module.eslint.parser).toEqual(QUALITY.TYPESCRIPT.PARSER);
      });

      test('Should extend eslint\'s "parser options" property', () => {
        const expected = expect.objectContaining(QUALITY.TYPESCRIPT.PARSER_OPTIONS);

        expect(module.eslint.parserOptions).toEqual(expected);
      });

      test('Should extend eslint\'s "plugins" property', () => {
        const expected = expect.arrayContaining(QUALITY.TYPESCRIPT.PLUGINS);

        expect(module.eslint.plugins).toEqual(expected);
      });

      test('Should update package.json\'s "devDependencies" property', () => {
        const expected = getExpectedObjectShape(QUALITY.TYPESCRIPT.DEV_DEPENDENCIES);

        expect(module.json.devDependencies).toEqual(expected);
      });
    });

    describe('> #_setupTestFiles', () => {
      beforeAll(() => module._setupTestFiles());

      test('Should extend jest\'s "moduleFileExtensions" property', () => {
        const expected = expect.arrayContaining(TEST.TYPESCRIPT.CONFIG.moduleFileExtensions);

        expect(module.json.jest.moduleFileExtensions).toEqual(expected);
      });

      test('Should rename "index.test.js" file to "index.test.ts"', () => {
        const expected = getExpectedObjectShape(TEST.TYPESCRIPT.DEV_DEPENDENCIES);

        expect(shell.test('-f', 'src/index.test.js')).toBeFalsy();
        expect(shell.test('-f', 'src/index.test.ts')).toBeTruthy();
      });

      test('Should update jest\'s "preset" property', () => {
        expect(module.json.jest.preset).toEqual(TEST.TYPESCRIPT.CONFIG.preset);
      });

      test('Should update jest\'s "testRegex" property', () => {
        expect(module.json.jest.testRegex).toEqual(TEST.TYPESCRIPT.CONFIG.testRegex);
      });

      test('Should update package.json\'s "devDependencies" property', () => {
        const expected = getExpectedObjectShape(TEST.TYPESCRIPT.DEV_DEPENDENCIES);

        expect(module.json.devDependencies).toEqual(expected);
      });
    });

    describe('> #_rewriteModifiedContentToFiles', () => {
      beforeAll(() => module._rewriteModifiedContentToFiles());

      test('Should rename "jsconfig.json" file to "tsconfig.json"', () => {
        expect(shell.test('-f', 'jsconfig.json')).toBeFalsy();
        expect(shell.test('-f', 'tsconfig.json')).toBeTruthy();
      });
    });
  });

  describe('> Implementation: ProjectCreator#run', () => {
    let module;

    beforeAll(async () => {
      module = new ProjectCreator(program);
      module.USER_QUESTIONS = [
        { name: 'type', value: 'node' },
        { name: 'useTypeScript', value: false },
        { name: 'useStorybook', value: false },
        { name: 'useDefaults', value: true },
      ];
    });

    afterAll(cleanupAndResetAfterTests);

    test('Should run without failing or throwing an error', () => {
      expect(async () => await module.run()).not.toThrow();
    });
  });
});
