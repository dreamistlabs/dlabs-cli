# placeholder

## Installation

To be documented.

## Usage

To be documented.

## Project Architecture

This project was created using `@dreamistlabs/dlabs-cli` and contains a predefined, opinionated set of rules, standards and tools aimed at making the development process more efficient and streamlined.

### Common Files

```
.
+-- .vscode
|   +-- extensions.json
|   +-- settings.json
+-- .auto-changelog.json
+-- .clocignore
+-- .editorconfig
+-- .gitignore
+-- changelog-template.hbs
+-- CHANGELOG.md
+-- handlebars.js
+-- package.json
+-- README.md
+-- REFERENCES.md
```

- **`.vscode`** - contains VS Code extension recommendations and settings, including formatting rules.
- **`.auto-changelog.json`** - configuration file for [auto-changelog](https://www.npmjs.com/package/auto-changelog).
- **`.clocignore`** - ignore file for [cloc](https://www.npmjs.com/package/cloc) utility tool.
- **`.editorconfig`** - configuration file aimed at maintaining consistent code between multiple developers, across different editor and IDEs, based on [editorConfig](https://editorconfig.org/)
- **`.gitignore`** - ignore file for git.
- **`changelog-template.hbs`** - template file used by `auto-changelog` to generate the `CHANGELOG.md` file.
- **`CHANGELOG.md`** - file containing the history of the project's changes. This file will be auto-generated by `auto-changelog`.
- **`handlebars.js`** - file containing pre-defined helper functions used in the `changelog-template.hbs` file for things like date formatting and prefix removals.
- **`package.json`** - package file containing dependencies, scripts and other configurations.
- **`README.md`** - _this file!_

# TODO
 - add logger to template projects
 - add react-router to cra projects?
 - add i18next for cra projects?