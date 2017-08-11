import * as spawn from 'cross-spawn';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';
import * as path from 'path';
import * as process from 'process';

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
    repoURL?: string;
    branch?: string;
    commitMsg?: string;
}

/**
 * The Ritsu Engine, responsible for all operations of the static site generate.
 *
 * @class Engine
 */
class Engine {
    public ejsParser: EjsParser;

    private engineRootPath: string;
    private defaultConfigPath: string;
    private rootPath: string;
    private archivePath: string;
    private postPath: string;
    private defaultConfig: SiteConfig;

    constructor() {
        this.engineRootPath = path.join(__dirname, '../..');
        this.defaultConfigPath = path.join(this.engineRootPath, Constants.DEFAULT_CONFIG_FILE);
        this.rootPath = process.cwd();

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
    public init(): void {
        if (fs.readdirSync(this.rootPath).length > 0) {
            Log.logErr('Current directory not empty, please run this command in an empty folder');
            return;
        }

        Log.logInfo('Initializing...');

        this.archivePath = path.join(this.rootPath, this.defaultConfig.archiveDir);
        this.postPath = path.join(this.rootPath, this.defaultConfig.postDir);

        const defaultThemePath: string = path.join('themes', this.defaultConfig.theme);

        fs.mkdir('drafts')
        .then(() => fs.mkdir('templates'))
        .then(() => fs.mkdir('themes'))
        .then(() => fs.mkdir(defaultThemePath))
        .then(() => fs.copy(this.defaultConfigPath, path.join(this.rootPath, Constants.DEFAULT_CONFIG_FILE)))
        .then(() => spawn.sync('git', ['clone', Constants.GIT_REPO_THEME_NOTES, defaultThemePath],
                            { stdio: 'inherit' }))
        .then(() => Log.logInfo('Blog successfully initialized! You can start writing :)'))
        .catch((e: Error) => Log.logErr(e.message));
    }
}

const newEngine = new Engine();
setTimeout(() => {
    newEngine.init();
}, 100);
