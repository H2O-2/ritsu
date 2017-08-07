// Create custom NodeJs File System methods using promise.

import * as Promise from 'bluebird';
import * as fs from 'fs';
import * as url from 'url';

export class NodeFs {
    public static nodeReadFile = Promise.promisify(fs.readFile);
    public static nodeWriteFile = Promise.promisify(fs.writeFile);
    public static nodeUnlink = Promise.promisify(fs.unlink);
    public static nodeExists = Promise.promisify(fs.exists);
    public static nodeMkdir = Promise.promisify(fs.mkdir);
    public static nodeRmdir = Promise.promisify(fs.rmdir);
    public static nodeReaddir = Promise.promisify(fs.readdir);
    public static nodeAccess = Promise.promisify(fs.access);
}
