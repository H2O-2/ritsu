import * as path from 'path';

import DefaultConfigs from './defaultConfigs';
import EjsParser from './ejsParser';

class Engine {
    private rootPath: string;

    constructor(rootPath: string) {
        this.rootPath = rootPath;
    }

    
}

const ejsParser = new EjsParser(path.join(DefaultConfigs.theme));
