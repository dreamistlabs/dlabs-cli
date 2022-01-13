#!/usr/bin/env node
import "core-js/stable";
import "regenerator-runtime/runtime";
import program from "commander";
import pckg from "../package.json";

// TODO: Find a way to reduce the files in bin/ folder and move the compiled files back to a build/ folder while keeping the git-style subcommands' file structure intact.

program.command("new <type> [directory]", "setup a new project", {
  executableFile: "./bin/dlabs-new.js",
});

program
  .usage("<cmd>")
  .version(pckg.version, "-v, --version")
  .parse(process.argv);
