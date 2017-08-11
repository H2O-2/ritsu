"use strict";
// Create custom NodeJs File System methods using promise.
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const util_1 = require("util");
class NodeFs {
}
NodeFs.nodeReadFile = util_1.promisify(fs.readFile);
NodeFs.nodeWriteFile = util_1.promisify(fs.writeFile);
NodeFs.nodeUnlink = util_1.promisify(fs.unlink);
NodeFs.nodeExists = util_1.promisify(fs.exists);
NodeFs.nodeMkdir = util_1.promisify(fs.mkdir);
NodeFs.nodeRmdir = util_1.promisify(fs.rmdir);
NodeFs.nodeReaddir = util_1.promisify(fs.readdir);
NodeFs.nodeAccess = util_1.promisify(fs.access);
NodeFs.readFileSync = fs.readFileSync;
NodeFs.readdirSync = fs.readdirSync;
exports.default = NodeFs;
