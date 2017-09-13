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
    engine.init(blog);
});
program.command('new <post> [template]').alias('n').description('Create a new post')
    .action((post, template) => {
    const engine = new engine_1.default();
    engine.newPost(post, true, template);
});
program.command('delete <post>').alias('d').description('Delete the post').action((post) => {
    const engine = new engine_1.default();
    engine.delete(post);
});
program.command('publish <post> [date]').alias('p').description('Publish the post')
    .action((post, date) => {
    const engine = new engine_1.default();
    engine.publish(post, date);
});
program.command('generate [dirName]').alias('g').description('Generate Site').action((dirName) => {
    const engine = new engine_1.default();
    engine.generate(dirName);
});
program.command('purge <dirName>').description('Purge generated blog').action((dirName) => {
    const engine = new engine_1.default();
    engine.purge(dirName);
});
program.command('deploy [dirName]').description('Deploy Site').action((dirName) => {
    const engine = new engine_1.default();
    engine.deploy(dirName);
});
program.version(VER).description(DESCRIPTION).parse(process.argv);
