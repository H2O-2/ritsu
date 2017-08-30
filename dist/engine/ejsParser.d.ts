import SiteConfig from './SiteConfig';
import ThemeConfig from './ThemeConfig';
declare class EjsParser {
    private ejsRoot;
    private postRoot;
    private generatePath;
    private siteConfig;
    private themeConfig;
    private layoutPath;
    constructor(ejsRoot: string, postRoot: string, generatePath: string, siteConfig: SiteConfig, themeConfig: ThemeConfig);
    render(fileArr: string[]): Promise<void>;
    private renderHeader();
    private renderPost(fileArr);
    private renderPage(ejsData, dirName, inputFile, createDir?);
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
