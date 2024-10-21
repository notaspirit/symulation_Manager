#!/usr/bin/env node

const { program } = require('commander');
const { getAppDataDir, getSymulationDir, newSymLinkFile, newSymLinkDir, delSymLinkFile, delSymLinkDir, listSymLinks, deleteSymLinkById, delSymLinkFileById } = require('./core');
program
  .version('1.0.0')
  .description('A simple CLI tool for managing sym links');
program
  .command('newfile <origin-path> <target-path>')
  .description('Create a file sym link')
  .action((originPath, targetPath) => {
    newSymLinkFile(originPath, targetPath); 
  });
program
  .command('newdir <origin-path> <target-path>')
  .description('Create a dir sym link')
  .action((originPath, targetPath) => {
    newSymLinkDir(originPath, targetPath);
  });
program
  .command('delentry <id>')
  .description('Delete a file or dir')
  .action((id) => {
    delSymLinkFileById(id);
  });
program
  .command('list')
  .description('List all sym links')
  .action(() => {
    listSymLinks();
  });
program.parse(process.argv);
