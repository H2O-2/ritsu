import * as chalk from 'chalk';
import * as commandExist from 'command-exists';
import * as spawn from 'cross-spawn';
import * as fs from 'fs-extra';
import * as hljs from 'highlight.js';
import * as yaml from 'js-yaml';
import * as marked from 'marked';
import * as moment from 'moment';
import * as path from 'path';
import * as process from 'process';

import Constants from './constants';
import DuplicateError from './duplicateError';
import EjsParser from './ejsParser';
import FrontMatter from './frontMatter';
import Log from './log';
import Post from './post';
import SassParser from './sassParser';
import SiteConfig from './SiteConfig';
import ThemeConfig from './ThemeConfig';

interface SiteDb {
    rootPath: string;
    defaultSiteConfig: SiteConfig;
    defaultThemeConfig: ThemeConfig;
    postData: Post[];
}

/**
 * The Ritsu Engine, responsible for all operations of the static site generate.
 *
 * @export
 * @class Engine
 */
export default class Engine {
    private engineRootPath: string;
    private defaultSiteConfigPath: string;
    private defaultThemeConfigPath: string;
    private initFilePath: string;

    private rootPath!: string;
    private draftPath!: string;
    private postPath!: string;
    private templatePath!: string;
    private themePath!: string;
    private trashPath!: string;
    private curDb!: SiteDb;
    private defaultSiteConfig!: SiteConfig;
    private customSiteConfig!: SiteConfig;
    private defaultThemeConfig!: ThemeConfig;
    private customThemeConfig!: ThemeConfig;

    constructor() {
        this.engineRootPath = path.join(__dirname, '..' + path.sep + '..');
        this.initFilePath = path.join(this.engineRootPath, `init${path.sep}`);
        this.defaultSiteConfigPath = path.join(this.engineRootPath, Constants.DEFAULT_SITE_CONFIG);
        this.defaultThemeConfigPath = path.join(this.engineRootPath, 'themes',
                                                Constants.DEFAULT_THEME, Constants.DEFAULT_THEME_CONFIG);
    }

    /**
     * Initialize an empty directory to a blog container.
     *
     * @returns {void}
     * @param {string} dirName
     * @memberof Engine
     */
    public init(dirName: string): void {
        if (!dirName) dirName = Constants.DEFAULT_DIR_NAME;

        dirName += path.sep;
        this.rootPath = path.join(process.cwd(), dirName);
        this.initEngine(this.rootPath);

        const defaultThemePath: string = path.join(this.themePath, Constants.DEFAULT_THEME);
        let dbData: SiteDb;

        fs.pathExists(this.rootPath)
        .then((exists: boolean) => {
            if (exists) throw new DuplicateError('A blog with the same name already exists here', dirName);
        })
        .then(() => Log.logInfo('Initializing...'))
        .then(() => fs.copySync(this.initFilePath, this.rootPath))
        .then(() => fs.copySync(this.defaultSiteConfigPath, path.join(this.rootPath, Constants.DEFAULT_SITE_CONFIG)))
        .then(() => fs.copySync(this.defaultThemeConfigPath, path.join(this.rootPath, Constants.DEFAULT_THEME_CONFIG)))
        .then(() => this.defaultSiteConfig = yaml.safeLoad(fs.readFileSync(this.defaultSiteConfigPath, 'utf8')))
        .then(() => this.defaultThemeConfig = yaml.safeLoad(fs.readFileSync(this.defaultThemeConfigPath, 'utf8')))
        .then(() =>
            dbData = {
                rootPath: this.rootPath,
                defaultSiteConfig: this.defaultSiteConfig,
                defaultThemeConfig: this.defaultThemeConfig,
                postData: [],
            })
        .then(() => fs.writeJSON(path.join(this.rootPath, Constants.DB_FILE), dbData))
        .then(() => process.chdir(this.rootPath))
        .then(() => this.publish('ritsu', undefined, false))
        .then(() => Log.logInfo('Fetching theme...'))
        .then(() => {
            if (commandExist.sync('git')) {
                this.git(['clone', Constants.GIT_REPO_THEME_NOTES, defaultThemePath],
                         { stdio: ['ignore', 'ignore', 'pipe'] }, this.rootPath);
            } else {
                throw new Error(`Git is not installed on your machine!\n\n` +
                `Check ${chalk.underline('https://git-scm.com/book/en/v2/Getting-Started-Installing-Git')}` +
                ` for the installation of git\n`);
            }
        })
        .then(() => Log.logInfo('Blog successfully initialized! You can start writing :)'))
        .catch((e: Error) => {
            Log.logErr(e.message);
            this.abortGen(e, dirName);
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
        .then(() => this.updateConfig())
        .then(() => {
            if (fs.pathExistsSync(path.join(this.draftPath, `${postName}.md`)) || this.checkDuplicate(postName)) {
                throw new Error(`Duplicate post name ${chalk.cyan(postName)}.`);
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
                ` created at ${chalk.underline.black(`${newDraftPath}`)}.`);
                Log.logInfo(`Run \`${chalk.blue('ritsu publish', postName)}\` when you finish writing.`);
            }
        })
        .catch((e: Error) => Log.logErr(e.message));
    }

    /**
     *
     * Delete the post from post directory and .db.json.
     *
     * @param {string} postName
     * @memberof Engine
     */
    public delete(postName: string) {
        const postFile: string = `${postName}.md`;
        const dneError: Error = new Error(`Post ${chalk.cyan(postName)} is either not published or does not exist.`);

        this.readDb()
        .then(() => {
            if (!fs.pathExistsSync(path.join(this.postPath, postFile))) {
                throw dneError;
            } else if (fs.pathExistsSync(path.join(this.trashPath, postFile))) {
                throw new Error(`A post with the same name already exists in directory` +
                                ` ${chalk.blue(path.relative(process.cwd(), this.trashPath))}.`);
            }
        })
        .then(() => Log.logInfo('Deleting...'))
        .then(() => fs.move(path.join(this.postPath, postFile), path.join(this.trashPath, postFile)))
        .then(() => {
            const postDataArr: Post[] = this.curDb.postData;

            for (let i = 0; i < postDataArr.length; i++) {
                if (postDataArr[i].fileName === postName) {
                    this.curDb.postData.splice(i, 1);
                    fs.writeJSONSync(path.join(this.rootPath, Constants.DB_FILE), this.curDb);
                    return;
                }
            }

            throw dneError;
        })
        .then(() => Log.logInfo(`Successfully deleted your post ${chalk.blue(postName)}, you can still find the post` +
                                ` inside ${chalk.blue(path.relative(process.cwd(), this.trashPath))} folder.`))
        .then(() => Log.logInfo(`If you want to restore the post, move it to` +
                                ` ${chalk.blue(path.relative(process.cwd(), this.draftPath))} folder` +
                                ` and publish it again`))
        .catch((e: Error) => Log.logErr(e.message));
    }

    /**
     *
     * Publish the post by moving the post to post directory and add data to .db.json.
     *
     * @param {string} postName
     * @param {string} [date]
     * @memberof Engine
     */
    public publish(postName: string, date?: string, outputInfo: boolean = true) {
        const postFile: string = `${postName}.md`;

        let draftPath: string;
        let postPath: string;

        this.readDb()
        .then(() => this.updateConfig())
        .then(() => {
            draftPath = path.join(this.draftPath, postFile);
            postPath = path.join(this.postPath, postFile);

            if (!fs.pathExistsSync(draftPath)) {
                throw new Error(`Post ${chalk.blue(postName)} does not exist, check your post name.`);
            }
        })
        .then(() => {
            if (outputInfo)
                Log.logInfo('Processing...');
        })
        .then(() => fs.move(draftPath, path.join(this.postPath, postFile)))
        .then(() => FrontMatter.parseFrontMatter(postPath))
        .then((frontMatter) => {
            const urlRegex: RegExp = /[ ;/?:@=&<>#\%\{\}\|\\\^~\[\]]/g;
            const postTime: moment.Moment = date ? moment(date) : moment();
            const newPost: Post = {
                fileName: postName,
                urlName: postName.replace(urlRegex, '-'),
                title: frontMatter.title,
                date: postTime.unix(),
                formatedDate: postTime.format(this.customSiteConfig.timeFormat),
                year: postTime.year().toString(),
                day: postTime.format(this.customSiteConfig.archiveTimeFormat),
                tags: frontMatter.tags,
                description: frontMatter.description ? marked(frontMatter.description) :
                                                       marked(this.findDescription(FrontMatter.parsePostStr(postPath))),
                headImg: frontMatter.headImg ? frontMatter.headImg : null,
                pageUrl: this.customSiteConfig.postDir,
                canonical: `/${this.customSiteConfig.postDir}/${postName}/`,
                prevPost: null,
                nextPost: this.curDb.postData.length > 0 ? this.curDb.postData[0].fileName : null,
            };

            if (this.curDb.postData.length > 0) this.curDb.postData[0].prevPost = newPost.fileName;

            if (date) {
                const curDate: number = newPost.date;
                let published: boolean = false;

                for (let i = 0; i < this.curDb.postData.length; i++) {
                    if (curDate >= this.curDb.postData[i].date) {
                        this.curDb.postData.splice(i, 0, newPost);
                        published = true;
                        break;
                    }
                }

                if (!published) this.curDb.postData.push(newPost);
            } else {
                // Reference of this neat way of pushing the element to the front of an array:
                // https://stackoverflow.com/a/39531492/7837815
                this.curDb.postData = [newPost, ...this.curDb.postData];
            }

            fs.writeJSONSync(path.join(this.rootPath, Constants.DB_FILE), this.curDb);
        })
        .then(() => {
            if (outputInfo)
                Log.logInfo(`Successfully published your post ${chalk.black.underline(postName)}.\n` +
                            `Run \`${chalk.blue('ritsu generate')}\` to build your blog.`);
        })
        .catch((e: Error) => Log.logErr(e.stack));
    }

    /**
     *
     * Generate publish directory containing the full blog site in the root of blog directory.
     *
     * @param {string} [dirName]
     * @memberof Engine
     */
    public generate(dirName: string) {
        let ejsParser: EjsParser;
        let sassParser: SassParser;
        let generatePath: string;
        let generatePathRel: string;

        if (!dirName) dirName = Constants.DEFAULT_GENERATE_DIR;

        this.readDb()
        .then(() => this.updateConfig())
        .then(() => generatePath = path.join(this.rootPath, dirName))
        .then(() => fs.pathExists(generatePath))
        .then((exists: boolean) => {
            generatePathRel = path.relative(process.cwd(), generatePath);

            if (exists)
                throw new DuplicateError(`Directory ${chalk.underline.cyan(generatePathRel)} already exists.` +
                ` Run \`${chalk.cyan('ritsu purge', dirName)}\` to delete the blog first or specify` +
                ` another directory name.`, dirName);
        })
        .then(() => Log.logInfo('Generating...'))
        .then(() => ejsParser = new EjsParser(this.rootPath, this.postPath, generatePath, this.themePath,
                                                this.curDb.postData, this.customSiteConfig, this.customThemeConfig))
        .then(() => {
            fs.mkdirSync(generatePath);
            fs.mkdirSync(path.join(generatePath, Constants.RES_DIR));
        })
        .then(() => ejsParser.render())
        .then(() => {
            const curResDir: string = path.join(this.themePath, Constants.DEFAULT_THEME, Constants.RES_DIR);
            const genResDir: string = path.join(generatePath, Constants.RES_DIR);

            sassParser = new SassParser(curResDir, genResDir, this.customSiteConfig, this.customThemeConfig);
            if (this.customSiteConfig.preprocess) {
                sassParser.render();
            } else fs.copySync(curResDir, genResDir);
        })
        .then(() => Log.logInfo(`Blog successfully generated in ${chalk.underline.blue(generatePathRel)} directory!` +
                                ` Run \`${chalk.blue('ritsu deploy')}\` to deploy blog.`))
        .catch((e: Error) => {
            Log.logErr(e.stack);
            this.abortGen(e, generatePath);
        });
    }

    public update(dirName: string) {
        let ejsParser: EjsParser;
        let updatePath: string;
        let backupPath: string;
        let publishExists: boolean;

        if (!dirName) dirName = Constants.DEFAULT_GENERATE_DIR;

        this.readDb()
        .then(() => this.updateConfig()
        .then(() => Log.logInfo('Updating...'))
        .then(() => {
            updatePath = path.join(this.rootPath, dirName);
            backupPath = path.join(this.rootPath, Constants.UPDATE_BACK);
        })
        .then(() => fs.pathExists(updatePath))
        .then((exists: boolean) => {
            if (!exists) throw new Error(`Directory ${chalk.cyan(dirName)} does not exist.`)
        })
        .then(() => publishExists = true)
        .then(() => fs.rename(updatePath, backupPath)) // rename old publish directory to .publish_back
        .then(() => fs.mkdir(updatePath))
        .then(() => fs.copy(backupPath, updatePath))
        .then(() => ejsParser = new EjsParser(this.rootPath, this.postPath, updatePath, this.themePath,
            this.curDb.postData, this.customSiteConfig, this.customThemeConfig)))
        .then(() => ejsParser.update())
        .then(() => spawn.sync('rm', ['-rf', backupPath], { stdio: 'inherit' }))
        .then(() => Log.logInfo('Note: This will only change HTML files related to new posts.'))
        .then(() => Log.logInfo(`If you want to apply more changes, ${chalk.blue('purge')} the site and ` +
                                `${chalk.blue('generate')} again.`))
        .then(() => Log.logInfo('Update Complete!'))
        .catch((e: Error) => {
            Log.logErr(e.message);
            this.abortGen(e, updatePath)
            .then(() => {
                if (publishExists) fs.renameSync(backupPath, updatePath); // recover .publish_back
            })
        })
    }

    /**
     *
     * Delete the blog generated.
     *
     * @param {string} dirName
     * @memberof Engine
     */
    public purge(dirName: string) {
        let deletePath: string;

        this.readDb()
        .then(() => {
            deletePath = path.join(this.rootPath, dirName);

            if (!fs.pathExistsSync(deletePath)) {
                throw new Error(`Directory ${chalk.cyan(dirName)} does not exist.`);
            } else if (!fs.pathExistsSync(path.join(deletePath, Constants.DEFAULT_HTML_NAME))) {
                throw new Error(`Please specify a directory generated by \`${chalk.cyan('ritsu generate')}\`.`);
            }
        })
        .then(() => Log.logInfo('Purging...'))
        .then(() => spawn.sync('rm', ['-rf', deletePath], { stdio: 'inherit' }))
        .then(() => Log.logInfo(`Directory ${chalk.blue.underline(path.relative(process.cwd(), dirName))} deleted!`))
        .catch((e: Error) => Log.logErr(e.message));
    }

    public deploy(dirName: string) {
        let deployPath: string;
        let generatePath: string;

        if (!dirName) dirName = Constants.DEFAULT_GENERATE_DIR;

        this.readDb()
        .then(() => this.updateConfig())
        .then(() => {
            deployPath = path.join(this.rootPath, Constants.DEPLOY_DIR);
            generatePath = path.join(this.rootPath, dirName);
        })
        .then(() => fs.pathExists(generatePath))
        .then((exists: boolean) => {
            if (!exists)
                throw new Error(`Directory ${chalk.cyan(dirName)} does not exists!`);
        })
        .then(() => fs.pathExists(deployPath))
        .then((exists: boolean) => {
            if (exists) return;

            Log.logInfo('First, initializing your Git repository...');
            fs.mkdirSync(deployPath);
            process.chdir(deployPath);

            this.git(['init'], { stdio: ['ignore', 'ignore', 'pipe'] });
            this.git(['config', 'user.name', this.customSiteConfig.userName],
                     { stdio: ['ignore', 'ignore', 'pipe'] });
            this.git(['config', 'user.email', this.customSiteConfig.userEmail],
                     { stdio: ['ignore', 'ignore', 'pipe'] });
            Log.logInfo('Initialization complete!');
        })
        .then(() => {
            Log.logInfo('Deploying...');
        })
        .then(() => fs.copy(generatePath, deployPath))
        .then(() => fs.createFile(path.join(deployPath, Constants.README_FILE)))
        .then(() => {
            if (!this.customSiteConfig.repoURL)
                throw new Error('Please set the URL to your Git repo in site-config.yaml file.');

            this.git(['add', '-A']);
            this.git(['commit', '-m', `${this.customSiteConfig.commitMsg}` +
                     `${moment().format(this.customSiteConfig.timeFormat)}`]);
            this.git(['push', '-u', this.customSiteConfig.repoURL,
                        `HEAD:${this.customSiteConfig.branch ? this.customSiteConfig.branch : 'master'}`, '--force']);
            Log.logInfo('Deployment complete!');
        })
        .catch((e: Error) => Log.logErr(e.message));
    }

    /**
     *
     * Check if postName already exists in .db.json
     *
     * @private
     * @param {string} postName
     * @returns {boolean}
     * @memberof Engine
     */
    private checkDuplicate(postName: string): boolean {
        const postDataArr: Post[] = fs.readJsonSync(path.join(this.rootPath, Constants.DB_FILE)).postData;

        for (const post of postDataArr) {
            if (post.fileName === postName) return true;
        }

        return false;
    }

    /**
     *
     * Read from site-config.yaml and theme-config.yaml file and update to newest custom configs.
     *
     * @private
     * @returns {Promise<void>}
     * @memberof Engine
     */
    private updateConfig(): Promise<void> {
        return fs.readFile(Constants.DEFAULT_SITE_CONFIG, 'utf8')
        .then((siteConfigStr: string) => this.customSiteConfig = yaml.safeLoad(siteConfigStr))
        .then(() => fs.readFile(Constants.DEFAULT_THEME_CONFIG, 'utf8'))
        .then((themeConfigStr: string) => this.customThemeConfig = yaml.safeLoad(themeConfigStr));
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
            .then((data: SiteDb | void) => {
                if (!data)
                    throw new Error(`Please execute this command in blog directory or run` +
                                    ` \`${chalk.cyan('ritsu init')}\` first`);

                this.rootPath = data.rootPath;
                this.defaultSiteConfig = data.defaultSiteConfig;
                this.defaultThemeConfig = data.defaultThemeConfig;
                this.curDb = data;
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
        this.trashPath = path.join(root, 'trash');
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
    private findDb(curPath: string): Promise<SiteDb|void> {
        const dbPath = path.join(curPath, Constants.DB_FILE);
        return fs.pathExists(dbPath)
        .then((exists: boolean) => {
            if (exists) {
                const data: SiteDb = fs.readJSONSync(dbPath);

                return data;
            } else {
                const parent = path.dirname(curPath);

                if (parent === curPath) return;

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
     * @param {DuplicateError|Error} engineError
     * @param {string} dirName
     * @memberof Engine
     */
    private abortGen(engineError: DuplicateError|Error, dirName: string): Promise<void> {
        return fs.pathExists(this.rootPath)
        .then((exists: boolean) => {
            if (exists) {
                Log.logPlain(chalk.bgRed.black('Reverting changes...'));
                if (!(engineError instanceof DuplicateError))
                    spawn.sync('rm', ['-rf', dirName], { stdio: 'inherit' });
            }
        })
        .catch((e: Error) => Log.logErr(e.message));
    }

    /**
     *
     * Filter description of the post by inline comment <!-- description -->
     *
     * @private
     * @param {string} postStr
     * @returns {string}
     * @memberof Engine
     */
    private findDescription(postStr: string): string {
        const splitDescription: RegExp= /^[\n]*([\s\S]*)<!-- description -->/;

        const regexArr = postStr.match(splitDescription);

        return regexArr === null ? '\n' : regexArr[1];
    }

    /**
     *
     * Runs git command with specified arguments.
     *
     * @private
     * @param {object} [options={ stdio: 'inherit' }]
     * @param {...string[]} args
     * @returns {void}
     * @memberof Engine
     */
    private git(args: string[], options: object = { stdio: 'inherit' },
                cwd: string = path.join(this.rootPath, Constants.DEPLOY_DIR)): void {
        if (args.length <= 0) return;

        Object.assign(options, { cwd });
        spawn.sync('git', args, options);
    }
}
