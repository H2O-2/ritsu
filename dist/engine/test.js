"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var invalidDate = 'hello';
var dateObj = new Date(invalidDate);
console.log(isNaN(dateObj.getDate()));
var Promise = require("bluebird");
var readFile = Promise.promisify(require("fs").readFile);
var yaml = require("js-yaml");
var fs_promise_1 = require("./promises/fs-promise");
fs_promise_1.default.nodeReadFile('./site-config.yaml', 'utf8').then(function (config) {
    var yamlOut = yaml.safeLoad(config);
    console.log(yamlOut);
}).catch(function (err) { return console.error('ERROR:', err); });
