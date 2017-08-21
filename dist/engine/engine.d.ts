import EjsParser from './ejsParser';
/**
 * The Ritsu Engine, responsible for all operations of the static site generate.
 *
 * @export
 * @class Engine
 */
export default class Engine {
    ejsParser: EjsParser;
    private engineRootPath;
    private defaultConfigPath;
    private initFilePath;
    private rootPath;
    private draftPath;
    private postPath;
    private templatePath;
    private themePath;
    private defaultConfig;
    constructor();
    readConfig(): Promise<string>;
    /**
     * Initialize an empty directory to a blog container.
     *
     * @returns {void}
     * @memberof Engine
     */
    init(dirName?: string): void;
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
    generate(dirName?: string): void;
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
     * Delete files created during initialization
     *
     * @private
     * @param {string} dirName
     * @memberof Engine
     */
    private abortInit(dirName);
}
