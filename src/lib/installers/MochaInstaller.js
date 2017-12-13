'use strict';

const shell = require('shelljs');

/** 
 * TODO
 * - install polyfill conditionally
 * - determine where to include polyfill?
 * - update babelrc and installation to account for various presets
 */

module.exports = class MochaInstaller {
	constructor() {

		this.initialize();
	}

	initialize() {

		this._installMochaChaiPackages();

	}

	// _addBabelRcFile(PATH) {

	//   shell.cp('-R', PATH + '/files/.babelrc', '.');
	// }

	_installMochaChaiPackages() {

		shell.echo("ordering mocha and chai...☕️ ");

    shell.exec("sleep 1 && npm install -D chai mocha");

	}

}