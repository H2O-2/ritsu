"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yaml = require("js-yaml");
const path = require("path");
const process = require("process");
const constants_1 = require("./constants");
const logging_1 = require("./logging");
const fs_promise_1 = require("./promises/fs-promise");
class Engine {
    constructor() {
        this.engineRootPath = path.join(__dirname, '../..');
        try {
            this.defaultConfig = yaml.safeLoad(fs_promise_1.default.readFileSync(path.join(this.engineRootPath, constants_1.default.DEFAULT_CONFIG_FILE), 'utf8'));
            // console.log(this.defaultConfig);
            this.rootPath = path.join(process.cwd(), this.defaultConfig.rootDir);
        }
        catch (e) {
            logging_1.default.logErr(e.message);
        }
    }
    init() {
        if (fs_promise_1.default.readdirSync(this.rootPath).length > 0) {
            logging_1.default.logErr('Current directory not empty, please run this command in an empty folder');
            return;
        }
        logging_1.default.logInfo('Initializing...');
        this.archivePath = path.join(this.rootPath, this.defaultConfig.archiveDir);
        this.postPath = path.join(this.rootPath, this.defaultConfig.postDir);
        fs_promise_1.default.nodeMkdir('drafts')
            .then(() => fs_promise_1.default.nodeMkdir('templates'))
            .then(() => fs_promise_1.default.nodeMkdir('themes'))
            .catch((e) => logging_1.default.logErr(e.message));
    }
}
const newEngine = new Engine();
newEngine.init();
