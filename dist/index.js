#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require("commander");
var VER = 'v0.0.1';
var DESCRIPTION = 'For Ritsu 📖\n\n  A simple static site generator.';
if (!process.argv.slice(2).length) {
    program.description(DESCRIPTION).help();
}
program.version(VER).description(DESCRIPTION).parse(process.argv);
