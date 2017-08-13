"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const spawn = require("cross-spawn");
const fs = require("fs-extra");
const yaml = require("js-yaml");
const path = require("path");
const process = require("process");
const tildify = require("tildify");
const constants_1 = require("./constants");
const logging_1 = require("./logging");
/**
 * The Ritsu Engine, responsible for all operations of the static site generate.
 *
 * @export
 * @class Engine
 */
class Engine {
    constructor() {
        this.engineRootPath = path.join(__dirname, '..' + path.sep + '..');
        this.defaultConfigPath = path.join(this.engineRootPath, constants_1.default.DEFAULT_CONFIG_FILE);
        this.initFilePath = path.join(this.engineRootPath, `init${path.sep}`);
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
    init(dirName = 'new-blog') {
        dirName += path.sep;
        this.rootPath = path.join(process.cwd(), dirName);
        this.initFile(this.rootPath);
        const defaultThemePath = path.join(this.themePath, constants_1.default.DEFAULT_THEME);
        const dbData = {
            rootPath: this.rootPath,
        };
        fs.pathExists(this.rootPath)
            .then((exists) => {
            if (exists)
                throw new Error('A blog with the same name already exists here');
        })
            .then(() => logging_1.default.logInfo('Initializing...'))
            .then(() => fs.copySync(this.initFilePath, this.rootPath))
            .then(() => spawn.sync('git', ['clone', constants_1.default.GIT_REPO_THEME_NOTES, defaultThemePath], { stdio: 'inherit' }))
            .then(() => fs.writeJSONSync(path.join(this.rootPath, constants_1.default.DB_FILE), dbData))
            .then(() => {
            // change working directory
            process.chdir(this.rootPath);
        })
            .then(() => this.newPost('ritsu', false))
            .then(() => logging_1.default.logInfo('Blog successfully initialized! You can start writing :)'))
            .catch((e) => {
            logging_1.default.logErr(e.message);
            return;
        });
    }
    newPost(postName, outputInfo = true, templateName) {
        this.readDb()
            .then(() => {
            if (fs.pathExistsSync(path.join(this.postPath, `${postName}.md`))) {
                throw new Error('Duplicate post name');
            }
        })
            .then(() => {
            if (outputInfo)
                logging_1.default.logInfo('Creating New Post...');
        })
            .then(() => {
            fs.copySync(path.join(this.templatePath, templateName ? `${templateName}.md` : `${constants_1.default.DEFAULT_TEMPLATE}.md`), path.join(this.postPath, `${postName}.md`));
        })
            .then(() => {
            if (outputInfo) {
                let newPostPath = tildify(path.relative(process.cwd(), this.postPath));
                if (process.cwd() === this.postPath) {
                    newPostPath = 'current directory';
                }
                logging_1.default.logInfo(`New Post ${chalk.underline.black(postName)}` +
                    ` created at ${chalk.underline.black(`${newPostPath}`)}`);
            }
        })
            .catch((e) => logging_1.default.logErr(e.message));
    }
    readDb() {
        return this.findDb(process.cwd())
            .then((path) => {
            if (path.length <= 0)
                throw new Error('Please run this command in blog directory or initialize first');
            this.rootPath = path;
            this.initFile(this.rootPath);
        })
            .catch((e) => {
            logging_1.default.logErr(e.message);
            return;
        });
    }
    /**
     *
     * Initialize paths of directories according to root directory.
     *
     * @private
     * @param {string} root
     * @memberof Engine
     */
    initFile(root) {
        this.postPath = path.join(root, 'posts');
        this.templatePath = path.join(root, 'templates');
        this.themePath = path.join(root, 'themes');
    }
    // Inspired by hexo-cli: https://github.com/hexojs/hexo-cli
    findDb(curPath) {
        const dbPath = path.join(curPath, constants_1.default.DB_FILE);
        return fs.pathExists(dbPath)
            .then((exists) => {
            if (exists) {
                const data = fs.readJSONSync(dbPath);
                return data.rootPath;
            }
            else {
                const parent = path.dirname(curPath);
                if (parent === curPath)
                    return '';
                return this.findDb(parent);
            }
        })
            .catch((e) => logging_1.default.logErr(e.message));
    }
}
exports.default = Engine;
// const newEngine = new Engine();
// setTimeout(() => {
//     // newEngine.newPost('test');
//     newEngine.init();
// }, 100);
