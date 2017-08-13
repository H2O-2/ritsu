import * as chalk from 'chalk';
import * as spawn from 'cross-spawn';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';
import * as path from 'path';
import * as process from 'process';
import * as tildify from 'tildify';

import Constants from './constants';
import EjsParser from './ejsParser';
import Log from './logging';

/**
 * Stores the options of site configurations. For details of the options see ./site-config.yaml.
 *
 * @interface SiteConfig
 */
interface SiteConfig {
    // See site-config.yaml for details
    siteName: string;
    siteDescription?: string;
    author: string;
    siteIcon?: string;
    createTime: string;
    avatar?: string;
    personalPage?: string;
    theme: string;
    rootDir: string;
    archiveDir: string;
    postDir: string;
    templateDir: string;
    repoURL?: string;
    branch?: string;
    commitMsg?: string;
}

interface SiteDb {
    rootPath: string;
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
    private postPath: string;
    private templatePath: string;
    private themePath: string;
    private defaultConfig: SiteConfig;

    constructor() {
        this.engineRootPath = path.join(__dirname, '..' + path.sep + '..');
        this.defaultConfigPath = path.join(this.engineRootPath, Constants.DEFAULT_CONFIG_FILE);
        this.initFilePath = path.join(this.engineRootPath, `init${path.sep}`);

        fs.readFile(this.defaultConfigPath, 'utf8')
        .then((fileContent: string) => this.defaultConfig = yaml.safeLoad(fileContent))
        .catch((e: Error) => Log.logErr(e.message));
    }

    /**
     * Initialize an empty directory to a blog container.
     *
     * @returns {void}
     * @memberof Engine
     */
    public init(dirName: string = 'new-blog'): void {
        dirName += path.sep;
        this.rootPath = path.join(process.cwd(), dirName);
        this.initFile(this.rootPath);

        const defaultThemePath: string = path.join(this.themePath, Constants.DEFAULT_THEME);
        const dbData = {
            rootPath: this.rootPath,
        };

        fs.pathExists(this.rootPath)
        .then((exists: boolean) => {
            if (exists) throw new Error('A blog with the same name already exists here');
        })
        .then(() => Log.logInfo('Initializing...'))
        .then(() => fs.copySync(this.initFilePath, this.rootPath))
        .then(() => spawn.sync('git', ['clone', Constants.GIT_REPO_THEME_NOTES, defaultThemePath],
                            { stdio: 'inherit' }))
        .then(() => fs.writeJSONSync(path.join(this.rootPath, Constants.DB_FILE), dbData))
        .then(() => {
            // change working directory
            process.chdir(this.rootPath);
        })
        .then(() => this.newPost('ritsu', false))
        .then(() => Log.logInfo('Blog successfully initialized! You can start writing :)'))
        .catch((e: Error) => {
            Log.logErr(e.message);
            return;
        });
    }

    public newPost(postName: string, outputInfo: boolean = true, templateName?: string): void {
        this.readDb()
        .then(() => {
            if (fs.pathExistsSync(path.join(this.postPath, `${postName}.md`))) {
                throw new Error('Duplicate post name');
            }
        })
        .then(() => {
            if (outputInfo) Log.logInfo('Creating New Post...');
        })
        .then(() => {
            fs.copySync(path.join(this.templatePath,
                        templateName ? `${templateName}.md` : `${Constants.DEFAULT_TEMPLATE}.md`),
                        path.join(this.postPath, `${postName}.md`));
        })
        .then(() => {
            if (outputInfo) {
                let newPostPath = tildify(path.relative(process.cwd(), this.postPath));

                if (process.cwd() === this.postPath) {
                    newPostPath = 'current directory';
                }

                Log.logInfo(`New Post ${chalk.underline.black(postName)}` +
                ` created at ${chalk.underline.black(`${newPostPath}`)}`);
            }
        })
        .catch((e: Error) => Log.logErr(e.message));
    }

    private readDb(): Promise<void> {
        return this.findDb(process.cwd())
            .then((path: string) => {
                if (path.length <= 0) throw new Error('Please run this command in blog directory or initialize first');

                this.rootPath = path;
                this.initFile(this.rootPath);
            })
            .catch((e: Error) => {
                Log.logErr(e.message);
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
    private initFile(root: string): void {
        this.postPath = path.join(root, 'posts');
        this.templatePath = path.join(root, 'templates');
        this.themePath = path.join(root, 'themes');
    }

    // Inspired by hexo-cli: https://github.com/hexojs/hexo-cli
    private findDb(curPath: string): Promise<any> {
        const dbPath = path.join(curPath, Constants.DB_FILE);

        return fs.pathExists(dbPath)
        .then((exists: boolean) => {
            if (exists) {
                const data: SiteDb = fs.readJSONSync(dbPath);

                return data.rootPath;
            } else {
                const parent = path.dirname(curPath);

                if (parent === curPath) return '';

                return this.findDb(parent);
            }
        })
        .catch((e: Error) => Log.logErr(e.message));
    }
}

// const newEngine = new Engine();
// setTimeout(() => {
//     // newEngine.newPost('test');
//     newEngine.init();
// }, 100);
