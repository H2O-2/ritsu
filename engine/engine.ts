import * as path from 'path';
import * as yaml from 'js-yaml';

import fs from './promises/fs-promise';
import DefaultConfigs from './defaultConfigs';
import EjsParser from './ejsParser';

class Engine {
    public ejsParser: EjsParser;

    private rootPath: string;
    private defaultConfig: Object;

    constructor(rootPath: string) {
        fs.nodeReadFile('./site-config.yaml', 'utf8').then((config) => {
            const yamlOut = yaml.safeLoad(config);
            console.log(yamlOut);
        }).catch((err) => console.error('ERROR:', err))
    }

    // private init(): void {

    // }
}
