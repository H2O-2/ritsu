#!/usr/bin/env node

import * as program from 'commander';
import * as process from 'process';

import Engine from './engine/engine';
import Log from './engine/logging';

const VER: string = 'v0.0.1';
const DESCRIPTION: string = 'For Ritsu 📖\n\n  A simple static site generator.';

if (!process.argv.slice(2).length) {
    program.description(DESCRIPTION).help();
}

program.command('init [blog]').alias('i').description('Initialize a new blog').action((blog: string) => {
    const engine = new Engine();

    engine.readConfig()
    .then(() => {
        if (blog) engine.init(`${blog}`);
        else engine.init();
    })
    .catch((e: Error) => Log.logErr(e.message));
});
program.command('new <post> [template]').alias('n').description('Create a new post')
       .action((post: string, template: string) => {
           const engine = new Engine();

           engine.newPost(post, true, template);
        });
program.command('generate [dirName]').alias('g').description('Generate Site').action((dirName: string) => {
    const engine = new Engine();

    engine.readConfig()
    .then(() => {
        if (dirName) engine.generate(dirName);
        else engine.generate();
    })
    .catch((e: Error) => Log.logErr(e.message));
});

program.version(VER).description(DESCRIPTION).parse(process.argv);
