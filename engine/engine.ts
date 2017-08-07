import * as path from 'path';

import DefaultConfigs from './defaultConfigs';
import EjsParser from './ejsParser';

class Engine {
    public ejsParser: EjsParser;

    private rootPath: string;

    constructor(rootPath: string) {
        this.rootPath = rootPath;
    }

    // private init(): void {

    // }
}
