import { assert, expect } from 'chai';
import shell from 'shelljs';
import fs from 'fs';
import path from 'path';
import fileExists from 'file-exists';
import ModuleMaker from '../src/lib/npmqs';

const PROJECT_NAME = 'project-tester';
const JSON_PROPERTIES = ['main', 'scripts', 'devDependencies'];
const JSON_SCRIPTS = [ 'compile'
										 , 'cover'
										 , 'prepublishOnly'
										 , 'test'
										 , 'watch'
			];
const JSON_DEVDEPENDENCIES = [ 'babel-cli'
														 , 'babel-polyfill'
														 , 'babel-preset-env'
														 , 'babel-register'
														 , 'chai'
														 , 'coveralls'
														 , 'istanbul'
														 , 'mocha'
			];
let module = new ModuleMaker(PROJECT_NAME);

describe('new ModuleMaker', () => {
  before('clean up test-related files', () => {
    shell.echo('starting clean up process...');
    console.log(shell.pwd().stdout);
    if (shell.test('-d', PROJECT_NAME)) {
      shell.exec('rm -rf ' + PROJECT_NAME);
      shell.echo(PROJECT_NAME + ' folder removed');
    }
    shell.echo('clean up complete.');
  });

	it('should be an instance of ModuleMaker', () => {
    expect(module instanceof ModuleMaker).to.be.true;
  });
	it('does not already have a folder with the project name', () => {
		expect(shell.test('-d', `${PROJECT_NAME}`)).to.be.false;
	});
	it('should give a warning if a folder with the same name already exists');
});

describe('FUNCTIONS', () => {

	// after('clean up test-related files', () => {
	// 	shell.echo('starting clean up process...');
 //    console.log(shell.pwd().stdout);
	// 	if (shell.test('-d', PROJECT_NAME)) {
	// 		shell.exec('rm -rf ' + PROJECT_NAME);
	// 		shell.echo('...' + PROJECT_NAME + ' folder removed');
	// 	}
	// 	shell.echo('clean up complete.');
	// });

	shell.mkdir(PROJECT_NAME);

	console.log('FUNCS', shell.pwd().stdout);

	describe('#setupFileStructure', () => {
		const [SRC, LIB, TEST] = ['src', 'lib', 'test'];
		before(() => {
			console.log('#setupFileStructure', shell.pwd().stdout);
			shell.cd(PROJECT_NAME);
			module.setupFileStructure();
		});
		after(() => {
			shell.cd('..');
		});

		it(`should create a ${SRC} folder`, () => {
			expect(shell.test('-d', SRC)).to.be.true;
		});
		it(`should create a ${LIB} folder inside of ${SRC}`, () => {
			expect(shell.test('-d', `${SRC}/${LIB}`)).to.be.true;
		});
		it(`should create a ${TEST} folder`, () => {
			expect(shell.test('-d', TEST)).to.be.true;
		});
	});

	describe('#addReadme', () => {
		const README = 'README.md';
		module.json.name = PROJECT_NAME;

		before(() => {
			console.log('#addREADME', shell.pwd().stdout);
			shell.cd(PROJECT_NAME);
			module.addReadme();
		});
		after(() => {
			shell.cd('..');
		});

		it('should create a README file in project directory', () => {
	  	expect(fileExists.sync(README)).to.be.true;
		});
		it('should contain the project name inside the README file', () => {
			expect(fs.readFileSync(README, 'utf-8')).to.include(PROJECT_NAME);
		});
	});

	describe('#copyFiles', () => {
		module.json.name = PROJECT_NAME;
		module.PATH = '..';

		before(() => {
			// console.log('#copyFiles', shell.pwd().stdout);
			shell.cd(PROJECT_NAME);
			module.copyFiles();
		});
		after(() => {
			shell.cd('..');
		});

		it('should create a main js file in library folder', () => {
			expect(fs.readdirSync('src/lib', 'utf-8').length).to.equal(1);
		});

		it('main js file should be named after project name', () => {
			expect(fs.readdirSync('src/lib', 'utf-8')[0]).to.include(PROJECT_NAME);
		});

		it('should create main test file in test folder', () => {
			expect(fs.readdirSync('test', 'utf-8').length).to.equal(1);
		});
		it('test file should be named after project name', () => {
			fs.readdir('test', 'utf-8', (err, list) => {
				if (err) throw err;
				expect(fs.readdirSync('test', 'utf-8')[0]).to.include(PROJECT_NAME);
			});
		});

		it('should create a .babelrc file', () => {
			expect(fileExists.sync('.babelrc')).to.be.true;
		});
		it('should create a .gitignore file', () => {
			expect(fileExists.sync('.gitignore')).to.be.true;
		});
		it('should create a .npmignore file', () => {
			expect(fileExists.sync('.npmignore')).to.be.true;
		});
		it('should create a CHANGELOG.md file', () => {
			expect(fileExists.sync('CHANGELOG.md')).to.be.true;
		});
	});

	describe('#updateJson', () => {
		before(() => {
			console.log('#updateJson', shell.pwd().stdout);
			shell.cd(PROJECT_NAME);
			module.updateJson();
		});
		after(() => {
			shell.cd('..');
		});

		it(`json should contain ${JSON_PROPERTIES[0]} property`, () => {
			expect(module.json).to.have.own.property(JSON_PROPERTIES[0]);
		});
		it(`json should contain ${JSON_PROPERTIES[1]} property`, () => {
			expect(module.json).to.have.own.property(JSON_PROPERTIES[1]);
		});
		it(`json should contain ${JSON_PROPERTIES[2]} property`, () => {
			expect(module.json).to.have.own.property(JSON_PROPERTIES[2]);
		});

		it('scripts property should contain scripts', () => {
			expect(module.json.scripts).to.have.all.keys(JSON_SCRIPTS);
		});
		it('scripts property should contain scripts', () => {
			expect(module.json.devDependencies).to.have.all.keys(JSON_DEVDEPENDENCIES);
		});
	});

	describe('#rewriteJson', () => {
    module.json = {
                        'name': PROJECT_NAME,
                        'scripts': {
                          'someScript': 'something',
                          'someOtherScript': 'something else'
                        },
                        'devDependencies': {
                          'someDependency': 'does something',
                          'someOtherDependency': 'does something else'
                        }
                      }
    before(() => {
      console.log('#rewriteJson', shell.pwd().stdout);
      shell.cd(PROJECT_NAME);
      shell.touch('package.json');
      module.rewriteJson();
    });
    after(() => {
      shell.cd('..');
    });
    it('package.json should contain name property', () => {
      let jsonFileData = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      expect(jsonFileData).to.have.own.property('name');
    });
    it('package.json should contain scripts property', () => {
      let jsonFileData = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      expect(jsonFileData).to.have.own.property('scripts');
    });
    it('package.json should contain devDependencies property', () => {
      let jsonFileData = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      expect(jsonFileData).to.have.own.property('devDependencies');
    });
  });

});
