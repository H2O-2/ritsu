"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yaml = require("js-yaml");
var fs_promise_1 = require("./promises/fs-promise");
var Engine = (function () {
    function Engine(rootPath) {
        fs_promise_1.default.nodeReadFile('./site-config.yaml', 'utf8').then(function (config) {
            var yamlOut = yaml.safeLoad(config);
            console.log(yamlOut);
        }).catch(function (err) { return console.error('ERROR:', err); });
    }
    return Engine;
}());
