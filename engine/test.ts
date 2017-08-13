import * as process from 'child_process';
import * as spawn from 'cross-spawn';
import ErrnoException from 'ErrnoException';
import * as fs from 'fs-extra';

const invalidDate: string = 'hello';

const dateObj = new Date(invalidDate);

// console.log(isNaN(dateObj.getDate()));

// var spawn = require('cross-spawn');
// const ls = spawn.sync('ls');
// console.log(ls);
// const ls = process.spawn('ls');
// ls.stdout.on('data', (data) => console.log(data));

fs.readFile('~/NaN').catch((e) => console.log(e.code));
