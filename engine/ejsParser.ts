// Parse ejs to html string

import * as ejs from 'ejs';
import * as fs from 'fs-extra';
import * as path from 'path';

import SiteConfig from './SiteConfig';
import ThemeConfig from './ThemeConfig';

class EjsParser {
    public readonly ejsRoot: string;

    private siteConfig: SiteConfig;
    private themeConfig: ThemeConfig;

    constructor(ejsRoot: string, siteConfig: SiteConfig, themeConfig: ThemeConfig) {
        this.ejsRoot = ejsRoot;
        this.siteConfig = siteConfig;
        this.themeConfig = themeConfig;
    }

    public render(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            ejs.renderFile(path.join(this.ejsRoot, 'layout.ejs'), { site: this.siteConfig, theme: this.themeConfig },
                            (renderError: Error, data: string) => {
                                if (renderError) reject(new Error(renderError.message));

                                resolve(data);
                            });
        });
    }
}

export default EjsParser;
