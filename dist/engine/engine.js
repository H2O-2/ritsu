"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spawn = require("cross-spawn");
const fs = require("fs-extra");
const yaml = require("js-yaml");
const path = require("path");
const process = require("process");
const constants_1 = require("./constants");
const logging_1 = require("./logging");
/**
 * The Ritsu Engine, responsible for all operations of the static site generate.
 *
 * @class Engine
 */
class Engine {
    constructor() {
        this.postDir = 'posts/';
        this.templateDir = 'template/';
        this.themeDir = 'themes';
        this.engineRootPath = path.join(__dirname, '../..');
        this.defaultConfigPath = path.join(this.engineRootPath, constants_1.default.DEFAULT_CONFIG_FILE);
        this.initFilePath = path.join(this.engineRootPath, 'init/');
        fs.readFile(this.defaultConfigPath, 'utf8')
            .then((fileContent) => this.defaultConfig = yaml.safeLoad(fileContent))
            .catch((e) => logging_1.default.logErr(e.message));
    }
    /**
     * Initialize an empty directory to a blog container.
     *
     * @returns {void}
     * @memberof Engine
     */
    init(dirName = 'new-blog/') {
        this.rootPath = path.join(process.cwd(), dirName);
        logging_1.default.logInfo('Initializing...');
        this.archivePath = path.join(this.rootPath, this.defaultConfig.archiveDir);
        this.postPath = path.join(this.rootPath, this.defaultConfig.postDir);
        const defaultThemePath = path.join(this.rootPath, this.themeDir, constants_1.default.DEFAULT_THEME);
        fs.copy(this.initFilePath, this.rootPath)
            .then(() => spawn.sync('git', ['clone', constants_1.default.GIT_REPO_THEME_NOTES, defaultThemePath], { stdio: 'inherit' }))
            .then(() => logging_1.default.logInfo('Blog successfully initialized! You can start writing :)'))
            .catch((e) => logging_1.default.logErr(e.message));
    }
}
const newEngine = new Engine();
setTimeout(() => {
    newEngine.init();
}, 100);
