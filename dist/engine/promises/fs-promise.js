"use strict";
// Create custom NodeJs File System methods using promise.
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var fs = require("fs");
var NodeFs = (function () {
    function NodeFs() {
    }
    NodeFs.nodeReadFile = Promise.promisify(fs.readFile);
    NodeFs.nodeWriteFile = Promise.promisify(fs.writeFile);
    NodeFs.nodeUnlink = Promise.promisify(fs.unlink);
    NodeFs.nodeExists = Promise.promisify(fs.exists);
    NodeFs.nodeMkdir = Promise.promisify(fs.mkdir);
    NodeFs.nodeRmdir = Promise.promisify(fs.rmdir);
    NodeFs.nodeReaddir = Promise.promisify(fs.readdir);
    NodeFs.nodeAccess = Promise.promisify(fs.access);
    return NodeFs;
}());
exports.default = NodeFs;
