// Create custom NodeJs File System methods using promise.

import * as fs from 'fs';
import * as url from 'url';
import { promisify } from 'util';

export default class NodeFs {
    public static nodeReadFile = promisify(fs.readFile);
    public static nodeWriteFile = promisify(fs.writeFile);
    public static nodeUnlink = promisify(fs.unlink);
    public static nodeExists = promisify(fs.exists);
    public static nodeMkdir = promisify(fs.mkdir);
    public static nodeRmdir = promisify(fs.rmdir);
    public static nodeReaddir = promisify(fs.readdir);
    public static nodeAccess = promisify(fs.access);

    public static readFileSync = fs.readFileSync;
    public static readdirSync = fs.readdirSync;
}
