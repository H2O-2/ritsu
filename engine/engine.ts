import * as spawn from 'cross-spawn';
import * as yaml from 'js-yaml';
import * as path from 'path';
import * as process from 'process';

import Constants from './constants';
import EjsParser from './ejsParser';
import Log from './logging';
// import fs from './promises/fs-promise';
import * as fs from 'fs-extra';

class Engine {
    public ejsParser: EjsParser;

    private engineRootPath: string;
    private defaultConfigPath: string;
    private rootPath: string;
    private archivePath: string;
    private postPath: string;
    private defaultConfig: object;

    constructor() {
        this.engineRootPath = path.join(__dirname, '../..');
        this.defaultConfigPath = path.join(this.engineRootPath, Constants.DEFAULT_CONFIG_FILE);

        try {
            this.defaultConfig = yaml.safeLoad(fs.readFileSync(this.defaultConfigPath, 'utf8'));
            // console.log(this.defaultConfig);
            this.rootPath = path.join(process.cwd(), this.defaultConfig.rootDir);
        } catch (e) {
            Log.logErr(e.message);
        }
    }

    public init(): void {
        if (fs.readdirSync(this.rootPath).length > 0) {
            Log.logErr('Current directory not empty, please run this command in an empty folder');
            return;
        }

        Log.logInfo('Initializing...');

        this.archivePath = path.join(this.rootPath, this.defaultConfig.archiveDir);
        this.postPath = path.join(this.rootPath, this.defaultConfig.postDir);

        fs.mkdir('drafts')
        .then(() => fs.mkdir('templates'))
        .then(() => fs.mkdir('themes'))
        .then(() => fs.copy(this.defaultConfigPath, path.join(this.rootPath, Constants.DEFAULT_CONFIG_FILE)))
        .catch((e) => Log.logErr(e.message));
    }
}

const newEngine = new Engine();
newEngine.init();
