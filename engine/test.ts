const invalidDate: string = 'hello';

const dateObj = new Date(invalidDate);

console.log(isNaN(dateObj.getDate()));

var Promise = require("bluebird");

var readFile = Promise.promisify(require("fs").readFile);

import * as path from 'path';
import * as yaml from 'js-yaml';

import fs from './promises/fs-promise';
import DefaultConfigs from './defaultConfigs';
import EjsParser from './ejsParser';

fs.nodeReadFile('./site-config.yaml', 'utf8').then((config) => {
            const yamlOut = yaml.safeLoad(config);
            console.log(yamlOut);
        }).catch((err) => console.error('ERROR:', err));
