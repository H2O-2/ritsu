import SiteConfig from './SiteConfig';
import ThemeConfig from './ThemeConfig';
declare class EjsParser {
    readonly ejsRoot: string;
    private siteConfig;
    private themeConfig;
    constructor(ejsRoot: string, siteConfig: SiteConfig, themeConfig: ThemeConfig);
    render(): Promise<string>;
}
export default EjsParser;
