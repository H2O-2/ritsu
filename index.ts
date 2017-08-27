#!/usr/bin/env node

import * as program from 'commander';
import * as process from 'process';

import Engine from './engine/engine';

const VER: string = 'v0.0.1';
const DESCRIPTION: string = 'For Ritsu 📖\n\n  A simple static site generator.';

if (!process.argv.slice(2).length) {
    program.description(DESCRIPTION).help();
}

program.command('init [blog]').alias('i').description('Initialize a new blog').action((blog: string) => {
    const engine = new Engine();

    engine.init(blog);
});

program.command('new <post> [template]').alias('n').description('Create a new post')
       .action((post: string, template: string) => {
           const engine = new Engine();

           engine.newPost(post, true, template);
        });

program.command('delete <post>').alias('d').description('Delete the post').action((post: string) => {
    const engine = new Engine();

    engine.delete(post);
})

program.command('publish <post> [date]').alias('p').description('Publish the post')
        .action((post: string, date: string) => {
            const engine = new Engine();

            engine.publish(post, date);
        });

program.command('generate [dirName]').alias('g').description('Generate Site').action((dirName: string) => {
    const engine = new Engine();

    engine.generate(dirName);
});

program.version(VER).description(DESCRIPTION).parse(process.argv);
