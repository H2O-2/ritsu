/**
 * The Ritsu Engine, responsible for all operations of the static site generate.
 *
 * @export
 * @class Engine
 */
export default class Engine {
    private engineRootPath;
    private defaultSiteConfigPath;
    private defaultThemeConfigPath;
    private initFilePath;
    private rootPath;
    private draftPath;
    private postPath;
    private templatePath;
    private themePath;
    private trashPath;
    private curTheme;
    private curDb;
    private defaultSiteConfig;
    private customSiteConfig;
    private defaultThemeConfig;
    private customThemeConfig;
    constructor();
    /**
     * Initialize an empty directory to a blog container.
     *
     * @returns {void}
     * @param {string} dirName
     * @memberof Engine
     */
    init(dirName: string): void;
    /**
     *
     * Create a new post inside posts folder.
     *
     * @param {string} postName
     * @param {boolean} [outputInfo=true]
     * @param {string} [templateName]
     * @memberof Engine
     */
    newPost(postName: string, outputInfo?: boolean, templateName?: string): void;
    /**
     *
     * Delete the post from post directory and .db.json.
     *
     * @param {string} postName
     * @memberof Engine
     */
    delete(postName: string): void;
    /**
     *
     * Publish the post by moving the post to post directory and add data to .db.json.
     *
     * @param {string} postName
     * @param {string} [date]
     * @memberof Engine
     */
    publish(postName: string, date?: string, outputInfo?: boolean): void;
    /**
     *
     * Generate publish directory containing the full blog site in the root of blog directory.
     *
     * @param {string} [dirName]
     * @memberof Engine
     */
    generate(dirName: string): void;
    /**
     *
     * Delete the blog generated.
     *
     * @param {string} dirName
     * @memberof Engine
     */
    purge(dirName: string): void;
    /**
     *
     * Check if postName already exists in .db.json
     *
     * @private
     * @param {string} postName
     * @returns {boolean}
     * @memberof Engine
     */
    private checkDuplicate(postName);
    /**
     *
     * Read from site-config.yaml and theme-config.yaml file and update to newest custom configs.
     *
     * @private
     * @returns {Promise<void>}
     * @memberof Engine
     */
    private updateConfig();
    /**
     *
     * Find and read the .db.json file in root directory of blog
     *
     * @private
     * @returns {Promise<void>}
     * @memberof Engine
     */
    private readDb();
    /**
     *
     * Initialize fields of the engine.
     *
     * @private
     * @param {string} root
     * @memberof Engine
     */
    private initEngine(root);
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
    private findDb(curPath);
    /**
     *
     * Delete files created during a failed operation.
     *
     * @private
     * @param {DuplicateError|Error} engineError
     * @param {string} dirName
     * @memberof Engine
     */
    private abortGen(engineError, dirName);
    /**
     *
     * Filter description of the post by inline comment <!-- description -->
     *
     * @private
     * @param {string} postStr
     * @returns {string}
     * @memberof Engine
     */
    private findDescription(postStr);
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
    private git(options, args);
}
