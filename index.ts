#!/usr/bin/env node

import * as program from 'commander';
import * as process from 'process';

const VER: string = 'v0.0.1';
const DESCRIPTION: string = 'For Ritsu 📖\n\n  A simple static site generator.';

if (!process.argv.slice(2).length) {
    program.description(DESCRIPTION).help();
}

program.version(VER).description(DESCRIPTION).parse(process.argv);
