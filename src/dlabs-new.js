#!/usr/bin/env node
import program from "commander";
import ProjectCreator from "./lib/ProjectCreator";

program
  .option("-f, --force", "force installation")
  .option("-s, --something", "something installation")
  .parse(process.argv);

new ProjectCreator(program);
