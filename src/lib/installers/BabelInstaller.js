'use strict';

const shell = require('shelljs');

/** 
 * TODO
 * - install polyfill conditionally
 * - determine where to include polyfill?
 * - update babelrc and installation to account for various presets
 */

module.exports = class BabelInstaller {
	constructor(path, json) {
		this.data = json;
		this.path = path;

		this.initialize();
	}

	initialize() {

		this._installBabelPackages();

		this._addBabelRcFile(this.path);

	}

	_addBabelRcFile(PATH) {

	  shell.cp('-R', PATH + '/files/.babelrc', '.');
	}

	_installBabelPackages() {

	  shell.echo("fetching babel...🗣");

	  shell.exec("sleep 1 && npm install -D babel-cli babel-preset-env");

	  shell.exec('npm install --save babel-polyfill');

	}

}