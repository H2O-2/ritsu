import SiteConfig from './SiteConfig';
import ThemeConfig from './ThemeConfig';
/**
 *
 * Parse Sass.
 *
 * @export
 * @class SassParser
 */
export default class SassParser {
    private sassRoot;
    private cssRoot;
    private fileArr;
    private siteConfig;
    private themeConfig;
    constructor(sassRoot: string, cssRoot: string, siteConfig: SiteConfig, themeConfig: ThemeConfig);
    /**
     *
     * Parses Sass files to a single css file and copy resources to res folder as well.
     * @returns {Promise<void>}
     * @memberof SassParser
     */
    render(): Promise<void>;
    /**
     *
     * Check recursively for non-style files and copy to res folder as resources.
     *
     * @private
     * @param {number} fileIndex
     * @returns {Promise<void>}
     * @memberof SassParser
     */
    private moveRes(fileIndex);
    /**
     *
     * Render an Sass string.
     *
     * @private
     * @param {string} sassData
     * @returns {Promise<string>}
     * @memberof SassParser
     */
    private renderSass(sassData);
}
