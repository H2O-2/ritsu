/// <reference types="node" />
import * as fs from 'fs';
export default class NodeFs {
    static nodeReadFile: typeof fs.readFile.__promisify__;
    static nodeWriteFile: typeof fs.writeFile.__promisify__;
    static nodeUnlink: typeof fs.unlink.__promisify__;
    static nodeExists: typeof fs.exists.__promisify__;
    static nodeMkdir: typeof fs.mkdir.__promisify__;
    static nodeRmdir: typeof fs.rmdir.__promisify__;
    static nodeReaddir: typeof fs.readdir.__promisify__;
    static nodeAccess: typeof fs.access.__promisify__;
    static readFileSync: typeof fs.readFileSync;
    static readdirSync: typeof fs.readdirSync;
}
