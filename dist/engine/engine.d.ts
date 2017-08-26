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
    private curTheme;
    private defaultSiteConfig;
    private customSiteConfig;
    private defaultThemeConfig;
    private customThemeConfig;
    constructor();
    /**
     * Initialize an empty directory to a blog container.
     *
     * @returns {void}
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
    publish(postName: string, date?: string): void;
    /**
     *
     * Generate publish directory containing the full blog site in the root of blog directory.
     *
     * @param {string} [dirName=Constants.DEFAULT_GENERATE_DIR]
     * @memberof Engine
     */
    generate(dirName: string): void;
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
     * @memberof Engine
     */
    private abortGen(engineError, dirName);
}
