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
    private postPath;
    private templatePath;
    private themePath;
    private defaultConfig;
    constructor();
    /**
     * Initialize an empty directory to a blog container.
     *
     * @returns {void}
     * @memberof Engine
     */
    init(dirName?: string): void;
    newPost(postName: string, outputInfo?: boolean, templateName?: string): void;
    private readDb();
    /**
     *
     * Initialize paths of directories according to root directory.
     *
     * @private
     * @param {string} root
     * @memberof Engine
     */
    private initFile(root);
    private findDb(curPath);
}
