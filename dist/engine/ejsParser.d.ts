import SiteConfig from './SiteConfig';
import ThemeConfig from './ThemeConfig';
declare class EjsParser {
    private ejsRoot;
    private siteConfig;
    private themeConfig;
    constructor(ejsRoot: string, siteConfig: SiteConfig, themeConfig: ThemeConfig);
    render(): string | void;
}
export default EjsParser;
