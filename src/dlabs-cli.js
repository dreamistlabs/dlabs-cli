#!/usr/bin/env node
import program from 'commander';
import pckg from '../package.json';
import ProjectCreator from './lib/ProjectCreator';

// TODO: Find a way to reduce the files in bin/ folder and move the compiled files back to a build/ folder while keeping the git-style subcommands' file structure intact.

program
  .name('dlabs-cli')
  .description(
    "Command-line interface for setting up various types of projects using DreamistLabs' architecture"
  )
  .usage('<project-name> [options]')
  .argument('<project-name>', "the project's name")
  .version(pckg.version, '-v, --version', 'show current version')
  .parse(process.argv);

new ProjectCreator(program);
