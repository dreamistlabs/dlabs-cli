"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var program = require("commander");
var shell = require("shelljs");
var child_process = require("child_process");
var fs = require("fs");
var fileExists = require("file-exists");

var VERSION = require("../package.json")["version"];
var PACKAGE_JSON = "package.json";

var _setupNewPackage = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var fileExist;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return fileExists(PACKAGE_JSON);

          case 2:
            fileExist = _context2.sent;


            if (!fileExist) _createJsonPackageFile();

            fs.readFile(PACKAGE_JSON, "utf-8", function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(err, data) {
                var json;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        if (!err) {
                          _context.next = 2;
                          break;
                        }

                        throw err;

                      case 2:
                        json = JSON.parse(data);


                        console.log(json.main);

                        _setupTestFramework(json);

                        _setupBabelCompiling(json);

                        _pointMainEntryFileToDistributionFolder(json);

                      case 7:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee, undefined);
              }));

              return function (_x, _x2) {
                return _ref2.apply(this, arguments);
              };
            }());

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function _setupNewPackage() {
    return _ref.apply(this, arguments);
  };
}();

var _createJsonPackageFile = function _createJsonPackageFile() {

  child_process.execSync("npm init", { stdio: "inherit" });

  return PACKAGE_JSON;
};

var _createFilesAndFolders = function _createFilesAndFolders(json) {

  _createEntryFile(json);

  _createSourceDirectoryAndFile(json);
};
var _createEntryFile = function _createEntryFile(json) {

  var entry = "src/" + json.name;

  // const content = `'use strict';\n\nrequire('./src/${json.name}.js);`;

  shell.touch(entry);

  // fs.writeFile(entry, content, err => { if (err) throw err; });
};

var _createSrcDirectoryAndFile = function _createSrcDirectoryAndFile(json) {

  shell.exec("mkdir src && touch src/" + json.name + ".js");
};

function _setupTestFramework(json) {

  shell.exec("mkdir test && touch test/" + json.name + ".test.js");
}

function _mocha(json) {
  var framework = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "mocha";


  switch (framework) {
    case "mocha":
      shell.echo("ordering mocha and chai... ☕️ ");
      shell.exec("sleep 2 && npm install -D chai mocha");
  }
}

function writeScripts(json) {
  json.scripts.test = "mocha --reporter spec";

  json.scripts.compile = "babel src -d lib -s inline";

  json.scripts.watch = "babel src -d lib -w";
}

function _setupBabelCompiling(json) {
  var content = "[\n  \"presets\": [\"env\"]\n]";

  shell.echo("fetching babel... 🗣");

  shell.exec("sleep 2 && npm install -D babel-cli babel-preset-env");

  shell.exec('npm install --save babel-polyfill');

  fs.writeFile(".babelrc", content, function (err) {
    if (err) throw err;
  });
}

function _pointMainEntryFileToDistributionFolder(json) {

  json.main = 'index.js';
}

function rewriteJson() {
  // fs.writeFile(fileName, JSON.stringify(json, null, 2), function(err) {
  //   //   if (err) return console.log(err);
  //   // })
}

program.version(VERSION).arguments("<dir>").action(function (dir) {
  shell.exec("echo Preparing npm package starter process... && sleep 2");
  shell.mkdir(dir);
  shell.cd(dir);

  _setupNewPackage();
});

program.parse(process.argv);