// Parse ejs to html string

import * as ejs from 'ejs';
import * as path from 'path';

import Log from './log';
import SiteConfig from './SiteConfig';
import ThemeConfig from './ThemeConfig';

class EjsParser {
    private ejsRoot: string;
    private siteConfig: SiteConfig;
    private themeConfig: ThemeConfig;

    constructor(ejsRoot: string, siteConfig: SiteConfig, themeConfig: ThemeConfig) {
        this.ejsRoot = ejsRoot;
        this.siteConfig = siteConfig;
        this.themeConfig = themeConfig;
    }

    public render(): string|void {
        try {
            ejs.renderFile(path.join(this.ejsRoot, path.sep, 'layout.ejs'),
                            { site: this.siteConfig, theme: this.themeConfig },
                            (renderError: Error, data: string) => {
                                return data;
            });
        } catch (renderError) {
            Log.logErr(renderError.message);
        }
    }
}

export default EjsParser;
