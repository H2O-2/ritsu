import SiteConfig from './SiteConfig';
import ThemeConfig from './ThemeConfig';
declare class EjsParser {
    private rootPath;
    private ejsRoot;
    private postRoot;
    private generatePath;
    private themePath;
    private siteConfig;
    private themeConfig;
    private layoutPath;
    constructor(rootPath: string, postRoot: string, generatePath: string, themePath: string, siteConfig: SiteConfig, themeConfig: ThemeConfig);
    /**
     *
     * Render all EJS files.
     *
     * @param {string[]} fileArr
     * @returns {Promise<void>}
     * @memberof EjsParser
     */
    render(fileArr: string[]): Promise<void>;
    /**
     *
     * Render all pages that header links directs to.
     *
     * @private
     * @returns {Promise<void[]>}
     * @memberof EjsParser
     */
    private renderHeader();
    /**
     *
     * Render all post pages.
     *
     * @private
     * @param {string[]} fileArr
     * @param {number} [fileIndex=0]
     * @returns {Promise<void>}
     * @memberof EjsParser
     */
    private renderPost(fileArr, fileIndex?);
    /**
     *
     * Render a page in folder `dirName` or in root directory of publish (index.html)
     *
     * @private
     * @param {string} ejsData
     * @param {string} dirName
     * @param {boolean} inputFile
     * @param {boolean} isIndexPage
     * @param {boolean} [createDir=true]
     * @returns {Promise<void>}
     * @memberof EjsParser
     */
    private renderPage(ejsData, dirName, inputFile, isIndexPage, createDir?);
    /**
     *
     * A promisified version of ejs.renderFile().
     *
     * @private
     * @param {string} filePath
     * @param {ejs.Data} data
     * @returns {Promise<string>}
     * @memberof EjsParser
     */
    private renderFile(filePath, data);
}
export default EjsParser;
