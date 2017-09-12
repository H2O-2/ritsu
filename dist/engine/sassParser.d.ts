import SiteConfig from './SiteConfig';
import ThemeConfig from './ThemeConfig';
export default class SassParser {
    private sassRoot;
    private cssRoot;
    private fileArr;
    private siteConfig;
    private themeConfig;
    constructor(sassRoot: string, cssRoot: string, siteConfig: SiteConfig, themeConfig: ThemeConfig);
    render(): Promise<void>;
    private moveRes(fileIndex);
    private renderSass(sassData);
    private readThemeConfig(field);
}
