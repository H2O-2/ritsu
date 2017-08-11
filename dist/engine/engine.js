"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yaml = require("js-yaml");
const path = require("path");
const process = require("process");
const constants_1 = require("./constants");
const logging_1 = require("./logging");
// import fs from './promises/fs-promise';
const fs = require("fs-extra");
class Engine {
    constructor() {
        this.engineRootPath = path.join(__dirname, '../..');
        this.defaultConfigPath = path.join(this.engineRootPath, constants_1.default.DEFAULT_CONFIG_FILE);
        try {
            this.defaultConfig = yaml.safeLoad(fs.readFileSync(this.defaultConfigPath, 'utf8'));
            // console.log(this.defaultConfig);
            this.rootPath = path.join(process.cwd(), this.defaultConfig.rootDir);
        }
        catch (e) {
            logging_1.default.logErr(e.message);
        }
    }
    init() {
        if (fs.readdirSync(this.rootPath).length > 0) {
            logging_1.default.logErr('Current directory not empty, please run this command in an empty folder');
            return;
        }
        logging_1.default.logInfo('Initializing...');
        this.archivePath = path.join(this.rootPath, this.defaultConfig.archiveDir);
        this.postPath = path.join(this.rootPath, this.defaultConfig.postDir);
        fs.mkdir('drafts')
            .then(() => fs.mkdir('templates'))
            .then(() => fs.mkdir('themes'))
            .then(() => fs.copy(this.defaultConfigPath, path.join(this.rootPath, constants_1.default.DEFAULT_CONFIG_FILE)))
            .catch((e) => logging_1.default.logErr(e.message));
    }
}
const newEngine = new Engine();
newEngine.init();
