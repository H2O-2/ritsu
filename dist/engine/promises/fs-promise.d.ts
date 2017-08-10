/// <reference types="node" />
import * as Promise from 'bluebird';
import * as fs from 'fs';
import * as url from 'url';
export default class NodeFs {
    static nodeReadFile: (arg1: string | number | Buffer | url.URL) => Promise<Buffer>;
    static nodeWriteFile: (arg1: string | number | Buffer | url.URL, arg2: any, arg3: (err: NodeJS.ErrnoException) => void) => Promise<{}>;
    static nodeUnlink: (arg1: fs.PathLike, arg2: (err: NodeJS.ErrnoException) => void) => Promise<{}>;
    static nodeExists: (arg1: fs.PathLike, arg2: (exists: boolean) => void) => Promise<{}>;
    static nodeMkdir: (arg1: fs.PathLike, arg2: (err: NodeJS.ErrnoException) => void) => Promise<{}>;
    static nodeRmdir: (arg1: fs.PathLike, arg2: (err: NodeJS.ErrnoException) => void) => Promise<{}>;
    static nodeReaddir: (arg1: fs.PathLike) => Promise<string[]>;
    static nodeAccess: (arg1: fs.PathLike, arg2: (err: NodeJS.ErrnoException) => void) => Promise<{}>;
}
