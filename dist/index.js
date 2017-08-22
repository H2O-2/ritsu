#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const process = require("process");
const engine_1 = require("./engine/engine");
const VER = 'v0.0.1';
const DESCRIPTION = 'For Ritsu 📖\n\n  A simple static site generator.';
if (!process.argv.slice(2).length) {
    program.description(DESCRIPTION).help();
}
program.command('init [blog]').alias('i').description('Initialize a new blog').action((blog) => {
    const engine = new engine_1.default();
    // engine.readConfig()
    // .then(() => {
    if (blog)
        engine.init(`${blog}`);
    else
        engine.init();
    // })
    // .catch((e: Error) => Log.logErr(e.message));
});
program.command('new <post> [template]').alias('n').description('Create a new post')
    .action((post, template) => {
    const engine = new engine_1.default();
    engine.newPost(post, true, template);
});
program.command('generate [dirName]').alias('g').description('Generate Site').action((dirName) => {
    const engine = new engine_1.default();
    // engine.readConfig()
    // .then(() => {
    if (dirName)
        engine.generate(dirName);
    else
        engine.generate();
    // })
    // .catch((e: Error) => Log.logErr(e.message));
});
program.version(VER).description(DESCRIPTION).parse(process.argv);
