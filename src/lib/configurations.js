const PACKAGE_VERSIONS = {
  '@babel/cli': '^7.18.9',
  '@babel/core': '^7.18.9',
  '@babel/node': '^7.18.9',
  '@babel/plugin-transform-modules-commonjs': '^7.18.6',
  '@babel/preset-env': '^7.18.9',
  '@babel/preset-typescript': '^7.18.6',
  '@commitlint/cli': '^17.0.3',
  '@dreamistlabs/config-commitlint': '^2.0.0',
  '@testing-library/jest-dom': '^5.16.4',
  '@testing-library/react': '^13.3.0',
  '@testing-library/react-hooks': '^8.0.1',
  '@testing-library/user-event': '^13.5.0',
  '@typescript-eslint/eslint-plugin': '^5.33.0',
  '@typescript-eslint/parser': '^5.33.0',
  '@types/jest': '^28.1.3',
  '@types/react': '^18.0.21',
  '@types/react-dom': '18.0.6',
  'auto-changelog': '^2.4.0',
  cloc: '^2.10.0',
  'cross-env': '^7.0.3',
  eslint: '^8.20.0',
  'eslint-config-airbnb-base': '^15.0.0',
  'eslint-config-prettier': '^8.5.0',
  'eslint-plugin-import': '2.25',
  'eslint-plugin-jest': '^26.6.0',
  'eslint-plugin-jest-dom': '^4.0.2',
  'eslint-plugin-jsx-a11y': '^6.6.1',
  'eslint-plugin-prettier': '^4.2.1',
  'eslint-plugin-react': '^7.30.1',
  'eslint-plugin-testing-library': '^5.5.1',
  husky: '^8.0.1',
  'identity-obj-proxy': '^3.0.0',
  jest: '^28.1.3',
  luxon: '^1.28.0',
  madge: '^5.0.1',
  nodemon: '^2.0.15',
  'npm-run-all': '^4.1.5',
  prettier: '^2.7.1',
  'pretty-quick': '^3.1.3',
  'ts-jest': '^28.0.8',
  'ts-node': '^10.9.1',
  typescript: '^4.7.4',
};

const JEST_ASSET_OBJECT_PATTERN =
  '.+\\.(css|less|sass|scss|jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$';

const addDependencies = dependencies => {
  return dependencies.reduce((acc, pkg) => ({ ...acc, [pkg]: PACKAGE_VERSIONS[pkg] }), {});
};

// TODO: React components may require different scripts
// for the output so they're not compiled.
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

export const PACKAGE_JSON_SORT_ORDER = [
  'private',
  'name',
  'version',
  'description',
  'author',
  'homepage',
  'license',
  'main',
  'bin',
  'keywords',
  'repository',
  'bugs',
  'publishConfig',
  'scripts',
  'auto-changelog',
  'babel',
  'eslintConfig',
  'jest',
  'prettier',
  'dependencies',
  'devDependencies',
];

const NODE = {
  base: {
    json: {
      dependencies: {},
      devDependencies: addDependencies([
        '@babel/cli',
        '@babel/core',
        '@babel/node',
        '@babel/plugin-transform-modules-commonjs',
        '@babel/preset-env',
        'nodemon',
      ]),
      scripts: {
        build: 'rm -rf dist && NODE_ENV=production babel src -d dist -s inline ',
        prepublishOnly: 'npm run build',
        start: 'nodemon --exec babel-node src/index.js',
        test: 'jest',
        watch: 'npm run build -- --watch',
      },
      babel: {
        presets: ['@babel/preset-env'],
        plugins: ['@babel/plugin-transform-modules-commonjs'],
      },
      jest: {
        moduleFileExtensions: ['js', 'ts'],
        testEnvironment: 'node',
        testRegex: '((\\.|/*.)(spec|test))\\.[jt]s?$',
        transform: { '\\.[jt]s$': 'babel-jest' },
        transformIgnorePatterns: [],
      },
      template: {
        name: 'placeholder',
        description: '',
        author: '',
        main: 'dist/index.js',
        license: 'MIT',
        version: '0.1.0',
        keywords: ['node', 'npm'],
        publishConfig: {
          access: 'public',
        },
        scripts: {},
        babel: {},
        eslintConfig: {
          extends: [],
          plugins: [],
        },
        dependencies: {},
        devDependencies: {},
        optionalDependencies: {},
      },
    },
    jsconfig: {
      compilerOptions: {
        target: 'es5',
        module: 'esnext',
        baseUrl: 'src',
        outDir: './dist',
        lib: ['dom', 'dom.iterable', 'esnext'],
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
      },
      exclude: ['node_modules', 'dist'],
      include: ['src/**/*'],
      ignore: ['**/*.test.js', '**/*.test.ts'],
    },
  },
};

const NODE_TYPESCRIPT = {
  base: {
    json: {
      dependencies: {},
      devDependencies: addDependencies(['@babel/preset-typescript', 'ts-node', 'typescript']),
      scripts: {
        build: 'rm -rf dist && NODE_ENV=production babel src -d dist -s inline --extensions .ts',
        'build:types': 'tsc --project tsconfig.json',
        prepublishOnly: 'npm run build && npm run build:types',
        start: 'nodemon dist/index.js',
      },
      babel: {
        presets: ['@babel/preset-typescript'],
      },
    },
    tsconfig: {
      compilerOptions: {
        declaration: true,
        emitDeclarationOnly: true,
      },
    },
  },
  dlabs: {
    json: {
      dependencies: {},
      devDependencies: addDependencies([
        '@types/jest',
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        'ts-jest',
      ]),
      eslintConfig: {
        extends: ['plugin:@typescript-eslint/recommended'],
        parser: '@typescript-eslint/parser',
        parserOptions: { project: ['./tsconfig.json'] },
        plugins: ['@typescript-eslint'],
      },
      jest: {
        preset: 'ts-jest',
        transform: { '\\.[jt]s$': 'ts-jest' },
      },
    },
  },
};

export const REACT = {
  base: {
    json: {
      // These are the defaults from create-react-app
      babel: {
        presets: ['react-app'],
      },
      eslintConfig: {
        extends: ['react-app', 'react-app/jest'],
        rules: { 'react-hooks/exhaustive-deps': 'warn' },
        // pull this out to a storybook obj? default with storybook
        overrides: [
          {
            files: ['**/*.stories.*'],
            rules: {
              'import/no-anonymous-default-export': 'off',
            },
          },
        ],
      },
      jest: {
        moduleNameMapper: {
          JEST_ASSET_OBJECT_PATTERN: 'identity-obj-proxy',
        },
        transformIgnorePatterns: [JEST_ASSET_OBJECT_PATTERN],
      },
    },
    jsconfig: {
      compilerOptions: {
        baseUrl: 'src',
      },
      exclude: ['node_modules'],
      include: ['src'],
      ignore: ['**/*.test.js', '**/*.test.ts'],
    },
  },
  dlabs: {
    json: {
      dependencies: addDependencies([
        '@testing-library/jest-dom',
        '@testing-library/react',
        '@testing-library/react-hooks',
        '@testing-library/user-event',
      ]),

      devDependencies: addDependencies([
        'eslint-plugin-jest-dom',
        'eslint-plugin-jsx-a11y',
        'eslint-plugin-react',
        'eslint-plugin-testing-library',
        'identity-obj-proxy',
      ]),
      eslintConfig: {
        extends: ['plugin:react/recommended', 'plugin:jsx-a11y/recommended'],
        parserOptions: { ecmaFeatures: { jsx: true } },
        plugins: ['testing-library', 'jest-dom', 'jsx-a11y'],
        settings: { react: { version: 'detect' } },
      },
    },
  },
};

const REACT_TYPESCRIPT = {
  base: {
    // no separate base json configuration from react
    json: {},
    tsconfig: {
      compilerOptions: {
        baseUrl: 'src',
        noImplicitAny: true,
        noImplicitThis: true,
        strictNullChecks: true,
      },
      exclude: ['node_modules'],
      ignore: ['**/*.test.js', '**/*.test.ts'],
    },
  },
  dlabs: {
    json: {
      dependencies: {},
      devDependencies: addDependencies([
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        // https://github.com/facebook/create-react-app/issues/6180
        '@types/jest',
        '@types/react',
        '@types/react-dom',
      ]),
      eslintConfig: {
        extends: ['plugin:@typescript-eslint/recommended'],
        parser: '@typescript-eslint/parser',
        parserOptions: { project: ['./tsconfig.json'] },
        plugins: ['@typescript-eslint'],
      },
    },
  },
};

const DREAMISTLABS = {
  base: {
    json: {
      devDependencies: addDependencies([
        '@commitlint/cli',
        '@dreamistlabs/config-commitlint',
        'auto-changelog',
        'cloc',
        'cross-env',
        'eslint',
        'eslint-config-airbnb-base',
        'eslint-config-prettier',
        'eslint-plugin-import',
        'eslint-plugin-jest',
        'eslint-plugin-prettier',
        'husky',
        'jest',
        'luxon',
        'madge',
        'npm-run-all',
        'prettier',
        'pretty-quick',
      ]),
      scripts: {
        changelog:
          'auto-changelog -p --handlebars-setup handlebars.js --template changelog-template.hbs',
        'changelog:debug': 'auto-changelog -p --template json --output changelog-preview.json',
        'changelog:persist':
          'npm run changelog && git add CHANGELOG.md && cross-env HUSKY=0 git commit -m "Chore: Updated CHANGELOG.md for release"',
        'circular-deps': 'madge --circular src',
        cloc: 'cloc --skip-win-hidden --exclude-dir=node_modules,bin,build,coverage,dist --exclude-ext=html --exclude-list-file=.clocignore *',
        'cloc:persist': 'npm run cloc -- --md --out=CLOC.md && git add CLOC.md',
        lint: 'eslint src --ext .js,.jsx,.ts,.tsx, --color --fix-dry-run',
        'pre-commit': 'run-s pretty-quick "test -- --changedFilesWithAncestor" cloc:persist',
        prepare: 'husky install',
        'pretty-check': 'prettier --check "src/**/*.{js,jsx,ts,tsx}"',
        'pretty-format': 'npm run pretty-check -- --write',
        'pretty-quick': 'pretty-quick --staged --pattern "src/**/*.*{js,jsx,ts,tsx}"',
        'push:tags': 'git push origin && git push origin --tags',
        'release:major': 'cross-env HUSKY=0 npm version major && run-s changelog:persist push:tags',
        'release:minor': 'cross-env HUSKY=0 npm version minor && run-s changelog:persist push:tags',
        'release:patch': 'cross-env HUSKY=0 npm version patch && run-s changelog:persist push:tags',
        'test:coverage': 'npm test -- --coverage',
        'test:watch': 'npm test -- --watch',
      },
      'auto-changelog': {
        commitLimit: false,
        unreleased: true,
        output: 'CHANGELOG.md',
        template: 'keepachangelog',
        replaceText: {
          '[Aa]dded:': '',
          '[Cc]hanged:': '',
          '[Cc]hore': '',
          '[Dd]eprecated:': '',
          '[Ff]ixed:': '',
          '[Rr]emoved:': '',
          '[Ss]ecurity:': '',
        },
        includeBranch: ['development', 'master'],
      },
      eslintConfig: {
        // env: {
        //   browser: true,
        //   es6: true,
        //   node: true,
        // },
        extends: ['eslint:recommended', 'plugin:prettier/recommended', 'plugin:jest/recommended'],
        // globals: {
        //   Atomics: 'readonly',
        //   SharedArrayBuffer: 'readonly',
        // },
        parserOptions: {
          ecmaVersion: 2020,
          project: ['./jsconfig.json'],
          sourceType: 'module',
        },
        plugins: ['jest'],
        rules: {
          'import/no-anonymous-default-export': 'off',
          'jest/no-disabled-tests': 'warn',
          'no-unused-vars': 'warn',
          'prettier/prettier': ['error', { endOfLine: 'auto' }],
        },
        settings: { jest: { version: 'detect' } },
      },
      jest: {
        coverageReporters: ['json', 'lcov', 'text', 'clover'],
        coverageThreshold: {
          global: { branches: 75, functions: 80, lines: 80, statements: 80 },
        },
        moduleDirectories: ['node_modules'],
      },
      prettier: {
        arrowParens: 'avoid',
        bracketSpacing: true,
        endOfLine: 'auto',
        printWidth: 100,
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
      },
    },
  },
};

/**
 *
 * @param {*} value
 * @returns
 */
const isObject = value => typeof value === 'object' && !Array.isArray(value) && value !== null;

/**
 *
 * @param {*} pkgJson
 * @returns
 */
export const preparePackageJsonForExport = pkgJson => {
  return Object.keys(
    sortObjectEntries(
      pkgJson,
      // Sorts items based on the sorting order
      (a, b) => PACKAGE_JSON_SORT_ORDER.indexOf(a) - PACKAGE_JSON_SORT_ORDER.indexOf(b)
    )
  ).reduce(
    (json, key) => ({
      ...json,
      [key]: isObject(pkgJson[key]) ? sortObjectEntries(pkgJson[key]) : pkgJson[key],
    }),
    {}
  );
};

/**
 *
 * @param {*} object
 * @param {*} compareFn
 * @returns
 */
export const sortObjectEntries = (object, compareFn = (a, b) => a[0].localeCompare(b[0])) => {
  const sortedEntries = Object.entries(object).sort(compareFn);

  return Object.fromEntries(sortedEntries);
};

export const CONFIGURATIONS = {
  DLABS: DREAMISTLABS,
  NODE: NODE,
  NODE_TS: NODE_TYPESCRIPT,
  REACT: REACT,
  REACT_TS: REACT_TYPESCRIPT,
};
