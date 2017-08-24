import * as chalk from 'chalk';
import * as commandExist from 'command-exists';
import * as spawn from 'cross-spawn';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';
import * as path from 'path';
import * as process from 'process';

import Constants from './constants';
import DuplicateError from './duplicateError';
import EjsParser from './ejsParser';
import Log from './log';
import SiteConfig from './SiteConfig';

interface SiteDb {
    rootPath: string;
    defaultConfig: SiteConfig;
}

/**
 * The Ritsu Engine, responsible for all operations of the static site generate.
 *
 * @export
 * @class Engine
 */
export default class Engine {
    public ejsParser: EjsParser;

    private engineRootPath: string;
    private defaultConfigPath: string;
    private initFilePath: string;
    private rootPath: string;
    private draftPath: string;
    private postPath: string;
    private templatePath: string;
    private themePath: string;
    private defaultConfig: SiteConfig;

    constructor() {
        this.engineRootPath = path.join(__dirname, '..' + path.sep + '..');
        this.defaultConfigPath = path.join(this.engineRootPath, Constants.DEFAULT_CONFIG_FILE);
        this.initFilePath = path.join(this.engineRootPath, `init${path.sep}`);
    }

    /**
     * Initialize an empty directory to a blog container.
     *
     * @returns {void}
     * @memberof Engine
     */
    public init(dirName: string = Constants.DEFAULT_DIR_NAME): void {
        dirName += path.sep;
        this.rootPath = path.join(process.cwd(), dirName);
        this.initEngine(this.rootPath);

        const defaultThemePath: string = path.join(this.themePath, Constants.DEFAULT_THEME, path.sep);
        let dbData: SiteDb;

        fs.pathExists(this.rootPath)
        .then((exists: boolean) => {
            if (exists) throw new DuplicateError('A blog with the same name already exists here', dirName);
        })
        .then(() => Log.logInfo('Initializing...'))
        .then(() => fs.copySync(this.initFilePath, this.rootPath))
        .then(() => this.defaultConfig = yaml.safeLoad(fs.readFileSync(this.defaultConfigPath, 'utf8')))
        .then(() => { dbData = { rootPath: this.rootPath, defaultConfig: this.defaultConfig }; })
        .then(() => Log.logInfo('Fetching theme...'))
        .then(() => {
            if (commandExist.sync('git')) {
                spawn.sync('git', ['clone', Constants.GIT_REPO_THEME_NOTES, defaultThemePath],
                            { stdio: ['ignore', 'ignore', 'pipe'] });
            } else {
                throw new Error(`Git is not installed on your machine!\n\n` +
                `Check ${chalk.underline('https://git-scm.com/book/en/v2/Getting-Started-Installing-Git')}` +
                ` for the installation of git\n`);
            }
        })
        .then(() => fs.writeJSONSync(path.join(this.rootPath, Constants.DB_FILE), dbData))
        .then(() => {
            // change working directory
            process.chdir(this.rootPath);
        })
        .then(() => this.newPost('ritsu', false))
        .then(() => Log.logInfo('Blog successfully initialized! You can start writing :)'))
        .catch((e: Error) => {
            Log.logErr(e.message);
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
    public newPost(postName: string, outputInfo: boolean = true, templateName?: string): void {
        this.readDb()
        .then(() => {
            if (fs.pathExistsSync(path.join(this.draftPath, `${postName}.md`))) {
                throw new Error('Duplicate post name');
            }
        })
        .then(() => {
            if (outputInfo) Log.logInfo('Creating New Post...');
        })
        .then(() => {
            const postPosn = path.join(this.draftPath, `${postName}.md`);

            if (templateName) {
                const templatePosn = path.join(this.templatePath, `${templateName}.md`);

                if (fs.pathExistsSync(templatePosn)) {
                    fs.copySync(templatePosn, postPosn);
                } else {
                    throw new Error(`Template '${templateName}' does not exist`);
                }
            } else {
                const defaultTemplatePosn = path.join(this.templatePath, `${Constants.DEFAULT_TEMPLATE}.md`);

                if (!fs.pathExistsSync(defaultTemplatePosn)) {
                    fs.copySync(path.join(this.initFilePath, 'templates', `${Constants.DEFAULT_TEMPLATE}.md`),
                                defaultTemplatePosn);
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

                Log.logInfo(`New Post ${chalk.underline.black(postName)}` +
                ` created at ${chalk.underline.black(`${newDraftPath}`)}`);
            }
        })
        .catch((e: Error) => Log.logErr(e.message));
    }

    /**
     *
     * Generate publish directory containing the full blog site in the root of blog directory.
     *
     * @param {string} [dirName=Constants.DEFAULT_GENERATE_DIR]
     * @memberof Engine
     */
    public generate(dirName: string = Constants.DEFAULT_GENERATE_DIR) {
        let generatePath: string;
        let generatePathRel: string;

        this.readDb()
        .then(() => generatePath = path.join(this.rootPath, dirName))
        .then(() => fs.pathExists(generatePath))
        .then((exists: boolean) => {
            generatePathRel = path.relative(process.cwd(), generatePath);

            if (exists)
                throw new DuplicateError(`Directory ${chalk.underline.cyan(generatePathRel)} already exists.` +
                ` Run \`${chalk.cyan('ritsu regenerate', dirName)}\` to regenerate blog or specify` +
                ` another directory name.`, dirName);
        })
        .then(() => Log.logInfo('Generating...'))
        .then(() => fs.mkdir(generatePath))
        .then(() => process.chdir(generatePath))
        .then(() => {
            fs.mkdirSync(this.defaultConfig.archiveDir);
            fs.mkdirSync(this.defaultConfig.postDir);
        })
        .then(() => Log.logInfo(`Blog successfully generated at ${chalk.underline.cyan(generatePathRel)}!` +
                ` Run \`${chalk.cyan('ritsu deploy')}\` to deploy blog.`))
        .catch((e: Error) => {
            Log.logErr(e.message);
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
    private readDb(): Promise<void> {
        return this.findDb(process.cwd())
            .then((data: SiteDb) => {
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
    private initEngine(root: string): void {
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
    private findDb(curPath: string): Promise<any> {
        const dbPath = path.join(curPath, Constants.DB_FILE);

        return fs.pathExists(dbPath)
        .then((exists: boolean) => {
            if (exists) {
                const data: SiteDb = fs.readJSONSync(dbPath);

                return data;
            } else {
                const parent = path.dirname(curPath);

                if (parent === curPath) return {};

                return this.findDb(parent);
            }
        })
        .catch((e: Error) => Log.logErr(e.message));
    }

    /**
     *
     * Delete files created during a failed operation.
     *
     * @private
     * @param {Error} engineError
     * @memberof Engine
     */
    private abortGen(engineError: Error): void {
        fs.pathExists(this.rootPath)
        .then((exists: boolean) => {
            if (exists) {
                Log.logPlain(chalk.bgRed.black('Reverting changes...'));
                if (!(engineError instanceof DuplicateError))
                    spawn.sync('rm', ['-rf', engineError], { stdio: 'inherit' });
            }
        })
        .catch((e: Error) => Log.logErr(e.message));
    }
}
