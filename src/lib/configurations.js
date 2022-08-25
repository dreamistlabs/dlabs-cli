export const COMMON = {
  DEV_DEPENDENCIES: {
    'auto-changelog': '^2.4.0',
    cloc: '^2.10.0',
    'cross-env': '^7.0.3',
    luxon: '^1.28.0',
    'npm-run-all': '^4.1.5',
  },
  SCRIPTS: {
    changelog:
      'auto-changelog -p --handlebars-setup handlebars.js --template changelog-template.hbs',
    'changelog:debug': 'auto-changelog -p --template json --output changelog-preview.json',
    'changelog:persist':
      'npm run changelog && git add CHANGELOG.md && cross-env HUSKY=0 git commit -m "Chore: Updated CHANGELOG.md for release"',
    cloc: 'cloc --skip-win-hidden --exclude-dir=node_modules,bin,build,coverage,dist --exclude-ext=html --exclude-list-file=.clocignore *',
    'cloc:persist': 'npm run cloc -- --md --out=CLOC.md && git add CLOC.md',
    'push:tags': 'git push origin && git push origin --tags',
    'release:major': 'cross-env HUSKY=0 npm version major && run-s changelog:persist push:tags',
    'release:minor': 'cross-env HUSKY=0 npm version minor && run-s changelog:persist push:tags',
    'release:patch': 'cross-env HUSKY=0 npm version patch && run-s changelog:persist push:tags',
  },
};

export const CONTINUOUS_INTEGRATION = {
  BASE: {
    DEV_DEPENDENCIES: {},
  },
  SCRIPTS: {},
};

export const NODE = {
  BASE: {
    DEPENDENCIES: {},
    DEV_DEPENDENCIES: {
      '@babel/cli': '^7.18.9',
      '@babel/core': '^7.18.9',
      '@babel/node': '^7.18.9',
      '@babel/plugin-transform-modules-commonjs': '^7.18.6',
      '@babel/preset-env': '^7.18.9',
      nodemon: '^2.0.15',
    },
    SCRIPTS: {
      build: 'rm -rf dist && NODE_ENV=production babel src -d dist -s inline',
      prepublishOnly: 'npm run build',
      start: 'nodemon --exec babel-node src/index.js',
      watch: 'npm run build -- --watch',
    },
  },
  TYPESCRIPT: {
    DEPENDENCIES: {},
    DEV_DEPENDENCIES: {
      '@babel/preset-typescript': '^7.18.6',
      'ts-node': '^10.9.1',
      typescript: '^4.7.4',
    },
    PARSER_OPTIONS: { project: ['./tsconfig.json'] },
    SCRIPTS: {
      build: 'rm -rf dist && babel src -d dist -s inline --extensions .ts',
      'build:types': 'tsc --project tsconfig.json',
      prepublishOnly: 'npm run build && npm run build:types',
      start: 'nodemon dist/index.js',
    },
    TSCONFIG: {
      compilerOptions: {
        declaration: true,
        emitDeclarationOnly: true,
        isolatedModules: true,
        noEmit: false,
      },
    },
  },
};

// TODO: Setup up create-react-app dependencies and scripts; add storybook?
export const REACT_COMPONENT = {
  DEPENDENCIES: {},
  DEV_DEPENDENCIES: {
    // '@babel/cli': '^7.18.9',
    // '@babel/core': '^7.18.9',
    // '@babel/preset-env': '^7.18.9',
  },
  SCRIPTS: {
    // build: 'rm -rf dist && NODE_ENV=production babel src/lib --out-dir dist --copy-files',
    // prepublishOnly: 'npm run build',
    // start: 'nodemon --exec babel-node src/index.js',
  },
};

export const QUALITY = {
  BASE: {
    DEV_DEPENDENCIES: {
      '@commitlint/cli': '^17.0.3',
      '@dreamistlabs/config-commitlint': '^1.0.3', // update to v2 after the 8/15's release
      eslint: '^8.20.0',
      'eslint-config-airbnb-base': '^15.0.0',
      'eslint-config-prettier': '^8.5.0',
      'eslint-plugin-import': '2.25',
      'eslint-plugin-prettier': '^4.2.1',
      husky: '^8.0.1',
      madge: '^5.0.1',
      prettier: '^2.7.1',
      'pretty-quick': '^3.1.3',
    },
    SCRIPTS: {
      'circular-deps': 'madge --circular src',
      lint: 'eslint src --ext .js,.jsx, --color --fix-dry-run',
      'pre-commit': 'run-s pretty-quick "test -- --changedFilesWithAncestor" cloc:persist',
      prepare: 'husky install',
      'pretty-check': 'prettier --check "src/**/*.{js,jsx}"',
      'pretty-format': 'npm run pretty-check -- --write',
      'pretty-quick': 'pretty-quick --staged --pattern "src/**/*.*{js,jsx}"',
    },
  },
  FULLSTACK: {
    DEV_DEPENDENCIES: {
      'eslint-config-react-app': '^7.0.1', // Included by default in create-react-app
      'eslint-plugin-react-hooks': '^4.6.0', // Included by default in create-react-app
    },
  },
  REACT: {
    DEV_DEPENDENCIES: {
      'eslint-plugin-jsx-a11y': '^6.6.1',
      'eslint-plugin-react': '^7.30.1',
    },
    EXTENDS: [
      'react-app',
      'react/jsx-runtime',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
    ],
    PARSER_OPTIONS: { ecmaFeatures: { jsx: true } },
    PLUGINS: ['jsx-a11y', 'react'],
    RULES: { 'react-hooks/exhaustive-deps': 'warn' },
    SETTINGS: { react: { version: 'detect' } },
  },
  TYPESCRIPT: {
    BABEL: { PRESETS: ['@babel/preset-typescript'] },
    DEV_DEPENDENCIES: {
      '@typescript-eslint/eslint-plugin': '^5.33.0',
      '@typescript-eslint/parser': '^5.33.0',
    },
    EXTENDS: ['plugin:@typescript-eslint/recommended'],
    PARSER: '@typescript-eslint/parser',
    PARSER_OPTIONS: { ecmaFeatures: { jsx: true } },
    PLUGINS: ['@typescript-eslint'],
    SCRIPTS: {
      lint: 'eslint src --ext .ts,.tsx, --color --fix-dry-run',
      'pretty-check': 'prettier --check "src/**/*.{ts,tsx}"',
      'pretty-quick': 'pretty-quick --staged --pattern "src/**/*.*{ts,tsx}"',
    },
  },
};

export const TEST = {
  BASE: {
    CONFIG: {
      collectCoverage: true,
      coverageReporters: ['json', 'lcov', 'text', 'clover'],
      coverageThreshold: {
        global: { branches: 75, functions: 80, lines: 80, statements: 80 },
      },
      moduleDirectories: ['node_modules'],
      moduleFileExtensions: ['js'],
      moduleNameMapper: {},
      testEnvironment: 'node',
      testRegex: '((\\.|/*.)(spec|test))\\.js?$',
      transformIgnorePatterns: [],
    },
    DEV_DEPENDENCIES: { jest: '^28.1.3', 'eslint-plugin-jest': '^26.6.0' },
    EXTENDS: ['plugin:jest/recommended'],
    PLUGINS: ['jest'],
    RULES: { 'jest/no-disabled-tests': 'warn' },
    SETTINGS: { jest: { version: 'detect' } },
    SCRIPTS: {
      test: 'jest',
      'test:coverage': 'jest --coverage',
      'test:watch': 'jest --watch',
    },
  },
  REACT: {
    CONFIG: {
      moduleFileExtensions: ['jsx'],
      moduleNameMapper: {
        '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
          '<rootDir>/__mocks__/fileMock.js',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
    },
    DEPENDENCIES: {
      // https://github.com/facebook/create-react-app/issues/6180#issuecomment-453640473
      '@testing-library/jest-dom': '^5.16.4',
      '@testing-library/react': '^13.3.0',
      '@testing-library/react-hooks': '^8.0.1',
      '@testing-library/user-event': '^13.5.0',
    },
    DEV_DEPENDENCIES: {
      'eslint-plugin-testing-library': '^5.5.1',
      'eslint-plugin-jest-dom': '^4.0.2',
      'identity-obj-proxy': '^3.0.0',
    },
    EXTENDS: ['react-app/jest', 'plugin:jest-dom/recommended'],
    PLUGINS: ['testing-library'],
    RULES: { 'react-hooks/exhaustive-deps': 'warn' },
  },
  TYPESCRIPT: {
    CONFIG: {
      moduleFileExtensions: ['ts'],
      preset: 'ts-jest',
      testRegex: '((\\.|/*.)(spec|test))\\.ts?$',
    },
    DEV_DEPENDENCIES: { '@types/jest': '^28.1.3', 'ts-jest': '^28.0.8' },
  },
};
