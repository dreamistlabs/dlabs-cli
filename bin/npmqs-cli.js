#!/usr/bin/env node
// TODO: Find a way to reduce the files in bin/ folder and move the compiled files back to a build/ folder while keeping the git-style subcommands' file structure intact.
"use strict";

const program = require('commander');

const VERSION = require('../package.json')['version'];

program.command('new <type> [directory]', 'setup a new project');
program.command('add <type> [directory]', 'add to an existing project');
program.usage('<cmd>') // .arguments('<dir>')
// .option('-c, --css [engine]', 'specify stylesheet engine (sass|less|default: css)', 'css')
// .option(
//   '-i, --integration [tool]',
//   'specify continuous integration tool (default: travis)',
//   'travis'
// )
// .option('-t, --test [framework]', 'specify test framework (default: mocha)', 'mocha')
.version(VERSION, '-v, --version').parse(process.argv);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ucG1xcy1jbGkuanMiXSwibmFtZXMiOlsicHJvZ3JhbSIsInJlcXVpcmUiLCJWRVJTSU9OIiwiY29tbWFuZCIsInVzYWdlIiwidmVyc2lvbiIsInBhcnNlIiwicHJvY2VzcyIsImFyZ3YiXSwibWFwcGluZ3MiOiJBQUFBO0FBRUE7OztBQUVBLE1BQU1BLE9BQU8sR0FBR0MsT0FBTyxDQUFDLFdBQUQsQ0FBdkI7O0FBQ0EsTUFBTUMsT0FBTyxHQUFHRCxPQUFPLENBQUMsaUJBQUQsQ0FBUCxDQUEyQixTQUEzQixDQUFoQjs7QUFFQUQsT0FBTyxDQUFDRyxPQUFSLENBQWdCLHdCQUFoQixFQUEwQyxxQkFBMUM7QUFDQUgsT0FBTyxDQUFDRyxPQUFSLENBQWdCLHdCQUFoQixFQUEwQyw0QkFBMUM7QUFFQUgsT0FBTyxDQUNKSSxLQURILENBQ1MsT0FEVCxFQUVFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFURixDQVVHQyxPQVZILENBVVdILE9BVlgsRUFVb0IsZUFWcEIsRUFXR0ksS0FYSCxDQVdTQyxPQUFPLENBQUNDLElBWGpCIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuXG4vLyBUT0RPOiBGaW5kIGEgd2F5IHRvIHJlZHVjZSB0aGUgZmlsZXMgaW4gYmluLyBmb2xkZXIgYW5kIG1vdmUgdGhlIGNvbXBpbGVkIGZpbGVzIGJhY2sgdG8gYSBidWlsZC8gZm9sZGVyIHdoaWxlIGtlZXBpbmcgdGhlIGdpdC1zdHlsZSBzdWJjb21tYW5kcycgZmlsZSBzdHJ1Y3R1cmUgaW50YWN0LlxuXG5jb25zdCBwcm9ncmFtID0gcmVxdWlyZSgnY29tbWFuZGVyJyk7XG5jb25zdCBWRVJTSU9OID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJylbJ3ZlcnNpb24nXTtcblxucHJvZ3JhbS5jb21tYW5kKCduZXcgPHR5cGU+IFtkaXJlY3RvcnldJywgJ3NldHVwIGEgbmV3IHByb2plY3QnKTtcbnByb2dyYW0uY29tbWFuZCgnYWRkIDx0eXBlPiBbZGlyZWN0b3J5XScsICdhZGQgdG8gYW4gZXhpc3RpbmcgcHJvamVjdCcpO1xuXG5wcm9ncmFtXG4gIC51c2FnZSgnPGNtZD4nKVxuICAvLyAuYXJndW1lbnRzKCc8ZGlyPicpXG4gIC8vIC5vcHRpb24oJy1jLCAtLWNzcyBbZW5naW5lXScsICdzcGVjaWZ5IHN0eWxlc2hlZXQgZW5naW5lIChzYXNzfGxlc3N8ZGVmYXVsdDogY3NzKScsICdjc3MnKVxuICAvLyAub3B0aW9uKFxuICAvLyAgICctaSwgLS1pbnRlZ3JhdGlvbiBbdG9vbF0nLFxuICAvLyAgICdzcGVjaWZ5IGNvbnRpbnVvdXMgaW50ZWdyYXRpb24gdG9vbCAoZGVmYXVsdDogdHJhdmlzKScsXG4gIC8vICAgJ3RyYXZpcydcbiAgLy8gKVxuICAvLyAub3B0aW9uKCctdCwgLS10ZXN0IFtmcmFtZXdvcmtdJywgJ3NwZWNpZnkgdGVzdCBmcmFtZXdvcmsgKGRlZmF1bHQ6IG1vY2hhKScsICdtb2NoYScpXG4gIC52ZXJzaW9uKFZFUlNJT04sICctdiwgLS12ZXJzaW9uJylcbiAgLnBhcnNlKHByb2Nlc3MuYXJndik7XG4iXX0=