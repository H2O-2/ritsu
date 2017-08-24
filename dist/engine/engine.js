"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const commandExist = require("command-exists");
const spawn = require("cross-spawn");
const fs = require("fs-extra");
const yaml = require("js-yaml");
const path = require("path");
const process = require("process");
const constants_1 = require("./constants");
const duplicateError_1 = require("./duplicateError");
const log_1 = require("./log");
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
    }
    /**
     * Initialize an empty directory to a blog container.
     *
     * @returns {void}
     * @memberof Engine
     */
    init(dirName = constants_1.default.DEFAULT_DIR_NAME) {
        dirName += path.sep;
        this.rootPath = path.join(process.cwd(), dirName);
        this.initEngine(this.rootPath);
        const defaultThemePath = path.join(this.themePath, constants_1.default.DEFAULT_THEME, path.sep);
        let dbData;
        fs.pathExists(this.rootPath)
            .then((exists) => {
            if (exists)
                throw new duplicateError_1.default('A blog with the same name already exists here', dirName);
        })
            .then(() => log_1.default.logInfo('Initializing...'))
            .then(() => fs.copySync(this.initFilePath, this.rootPath))
            .then(() => this.defaultConfig = yaml.safeLoad(fs.readFileSync(this.defaultConfigPath, 'utf8')))
            .then(() => { dbData = { rootPath: this.rootPath, defaultConfig: this.defaultConfig }; })
            .then(() => log_1.default.logInfo('Fetching theme...'))
            .then(() => {
            if (commandExist.sync('git')) {
                spawn.sync('git', ['clone', constants_1.default.GIT_REPO_THEME_NOTES, defaultThemePath], { stdio: ['ignore', 'ignore', 'pipe'] });
            }
            else {
                throw new Error(`Git is not installed on your machine!\n\n` +
                    `Check ${chalk.underline('https://git-scm.com/book/en/v2/Getting-Started-Installing-Git')}` +
                    ` for the installation of git\n`);
            }
        })
            .then(() => fs.writeJSONSync(path.join(this.rootPath, constants_1.default.DB_FILE), dbData))
            .then(() => {
            // change working directory
            process.chdir(this.rootPath);
        })
            .then(() => this.newPost('ritsu', false))
            .then(() => log_1.default.logInfo('Blog successfully initialized! You can start writing :)'))
            .catch((e) => {
            log_1.default.logErr(e.message);
            this.abortGen(e);
            return;
        });
    }
    /**
     *
     * Create a new post inside posts folder.
     *
     * @param {string} postName
     * @param {boolean} [outputInfo=true]
     * @param {string} [templateName]
     * @memberof Engine
     */
    newPost(postName, outputInfo = true, templateName) {
        this.readDb()
            .then(() => {
            if (fs.pathExistsSync(path.join(this.draftPath, `${postName}.md`))) {
                throw new Error('Duplicate post name');
            }
        })
            .then(() => {
            if (outputInfo)
                log_1.default.logInfo('Creating New Post...');
        })
            .then(() => {
            const postPosn = path.join(this.draftPath, `${postName}.md`);
            if (templateName) {
                const templatePosn = path.join(this.templatePath, `${templateName}.md`);
                if (fs.pathExistsSync(templatePosn)) {
                    fs.copySync(templatePosn, postPosn);
                }
                else {
                    throw new Error(`Template '${templateName}' does not exist`);
                }
            }
            else {
                const defaultTemplatePosn = path.join(this.templatePath, `${constants_1.default.DEFAULT_TEMPLATE}.md`);
                if (!fs.pathExistsSync(defaultTemplatePosn)) {
                    fs.copySync(path.join(this.initFilePath, 'templates', `${constants_1.default.DEFAULT_TEMPLATE}.md`), defaultTemplatePosn);
                }
                fs.copySync(defaultTemplatePosn, postPosn);
            }
        })
            .then(() => {
            if (outputInfo) {
                let newDraftPath = path.relative(process.cwd(), this.draftPath);
                if (process.cwd() === this.draftPath) {
                    newDraftPath = 'current directory';
                }
                log_1.default.logInfo(`New Post ${chalk.underline.black(postName)}` +
                    ` created at ${chalk.underline.black(`${newDraftPath}`)}`);
            }
        })
            .catch((e) => log_1.default.logErr(e.message));
    }
    /**
     *
     * Generate publish directory containing the full blog site in the root of blog directory.
     *
     * @param {string} [dirName=Constants.DEFAULT_GENERATE_DIR]
     * @memberof Engine
     */
    generate(dirName = constants_1.default.DEFAULT_GENERATE_DIR) {
        let generatePath;
        let generatePathRel;
        this.readDb()
            .then(() => generatePath = path.join(this.rootPath, dirName))
            .then(() => fs.pathExists(generatePath))
            .then((exists) => {
            generatePathRel = path.relative(process.cwd(), generatePath);
            if (exists)
                throw new duplicateError_1.default(`Directory ${chalk.underline.cyan(generatePathRel)} already exists.` +
                    ` Run \`${chalk.cyan('ritsu regenerate', dirName)}\` to regenerate blog or specify` +
                    ` another directory name.`, dirName);
        })
            .then(() => log_1.default.logInfo('Generating...'))
            .then(() => fs.mkdir(generatePath))
            .then(() => process.chdir(generatePath))
            .then(() => {
            fs.mkdirSync(this.defaultConfig.archiveDir);
            fs.mkdirSync(this.defaultConfig.postDir);
        })
            .then(() => log_1.default.logInfo(`Blog successfully generated at ${chalk.underline.cyan(generatePathRel)}!` +
            ` Run \`${chalk.cyan('ritsu deploy')}\` to deploy blog.`))
            .catch((e) => {
            log_1.default.logErr(e.message);
            this.abortGen(e);
        });
    }
    /**
     *
     * Find and read the .db.json file in root directory of blog
     *
     * @private
     * @returns {Promise<void>}
     * @memberof Engine
     */
    readDb() {
        return this.findDb(process.cwd())
            .then((data) => {
            if (!data.rootPath)
                throw new Error('Please run this command in blog directory or initialize first');
            this.rootPath = data.rootPath;
            this.defaultConfig = data.defaultConfig;
            this.initEngine(this.rootPath);
        });
    }
    /**
     *
     * Initialize fields of the engine.
     *
     * @private
     * @param {string} root
     * @memberof Engine
     */
    initEngine(root) {
        this.draftPath = path.join(root, 'drafts');
        this.postPath = path.join(root, 'posts');
        this.templatePath = path.join(root, 'templates');
        this.themePath = path.join(root, 'themes');
        this.defaultConfigPath = path.join(root, 'site-config.yaml');
    }
    /**
     *
     * Inspired by hexo-cli: https://github.com/hexojs/hexo-cli
     *
     * Find .db.json file in current and parent directories.
     *
     * @private
     * @param {string} curPath
     * @returns {Promise<any>}
     * @memberof Engine
     */
    findDb(curPath) {
        const dbPath = path.join(curPath, constants_1.default.DB_FILE);
        return fs.pathExists(dbPath)
            .then((exists) => {
            if (exists) {
                const data = fs.readJSONSync(dbPath);
                return data;
            }
            else {
                const parent = path.dirname(curPath);
                if (parent === curPath)
                    return {};
                return this.findDb(parent);
            }
        })
            .catch((e) => log_1.default.logErr(e.message));
    }
    /**
     *
     * Delete files created during a failed operation.
     *
     * @private
     * @param {Error} engineError
     * @memberof Engine
     */
    abortGen(engineError) {
        fs.pathExists(this.rootPath)
            .then((exists) => {
            if (exists) {
                log_1.default.logPlain(chalk.bgRed.black('Reverting changes...'));
                if (!(engineError instanceof duplicateError_1.default))
                    spawn.sync('rm', ['-rf', engineError], { stdio: 'inherit' });
            }
        })
            .catch((e) => log_1.default.logErr(e.message));
    }
}
exports.default = Engine;
