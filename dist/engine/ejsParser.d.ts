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
    render(fileArr: string[]): Promise<void>;
    test(fileArr: string[]): Promise<void>;
    private renderHeader();
    private renderPost(fileArr, fileIndex?);
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
