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
    private initFilePath: string;
    private rootPath: string;
    private archivePath: string;
    private postPath: string;
    private defaultConfig: SiteConfig;

    private readonly postDir: string = 'posts/';
    private readonly templateDir: string = 'template/';
    private readonly themeDir: string = 'themes';

    constructor() {
        this.engineRootPath = path.join(__dirname, '../..');
        this.defaultConfigPath = path.join(this.engineRootPath, Constants.DEFAULT_CONFIG_FILE);
        this.initFilePath = path.join(this.engineRootPath, 'init/');

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
    public init(dirName: string = 'new-blog/'): void {
        this.rootPath = path.join(process.cwd(), dirName);

        Log.logInfo('Initializing...');

        this.archivePath = path.join(this.rootPath, this.defaultConfig.archiveDir);
        this.postPath = path.join(this.rootPath, this.defaultConfig.postDir);

        const defaultThemePath: string = path.join(this.rootPath, this.themeDir, Constants.DEFAULT_THEME);

        fs.copy(this.initFilePath, this.rootPath)
        .then(() => spawn.sync('git', ['clone', Constants.GIT_REPO_THEME_NOTES, defaultThemePath],
                            { stdio: 'inherit' }))
        .then(() => Log.logInfo('Blog successfully initialized! You can start writing :)'))
        .catch((e: Error) => Log.logErr(e.message));
    }

    // public newPost(postName: string, templateName: string = '', outputInfo: boolean = true): void {
    //     if (templateName) {
    //         fs.copy()
    //     }
    // }
}

const newEngine = new Engine();
setTimeout(() => {
    newEngine.init();
}, 100);
