// Parse ejs to html string

import * as ejs from 'ejs';
import * as fs from 'fs-extra';
import * as marked from 'marked';
import * as path from 'path';

import Constants from './constants';
import SiteConfig from './SiteConfig';
import ThemeConfig from './ThemeConfig';

class EjsParser {
    public readonly ejsRoot: string;

    private postRoot: string;
    private generatePath: string;
    private siteConfig: SiteConfig;
    private themeConfig: ThemeConfig;
    private layoutPath: string;

    constructor(ejsRoot: string, postRoot: string, generatePath: string,
                siteConfig: SiteConfig, themeConfig: ThemeConfig) {
        this.ejsRoot = ejsRoot;
        this.postRoot = postRoot;
        this.siteConfig = siteConfig;
        this.themeConfig = themeConfig;
        this.layoutPath = path.join(this.ejsRoot, Constants.EJS_LAYOUT);
    }

    public render(fileArr: string[]): Promise<void> {
        return this.renderPost(fileArr)
        .then(() => this.renderPage(Constants.DEFAULT_HTML_NAME, false))
        .then(() => this.renderPage(path.join(this.generatePath, this.siteConfig.archiveDir)))
        .then(() => this.renderPage(path.join(this.generatePath, this.siteConfig.postDir)))
        .then(() => {
            // reference:
            // https://stackoverflow.com/questions/10687099/how-to-test-if-a-url-string-is-absolute-or-relative
            const isAbsolute: RegExp = new RegExp('^(?:[a-z]+:)?//', 'i');
            const headers = this.themeConfig.header;

            for (const headName in headers) {
                if (headers.hasOwnProperty(headName)) {
                    const headLink: string = path.join(this.generatePath, headers[headName]);

                    if (isAbsolute.test(headers[headName]) || fs.pathExistsSync(headLink)) continue;

                    this.renderPage(headLink);
                }
            }
        });
    }

    private renderPost(fileArr: string[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const contentArr: string[] = [];
            let mainContent: string;

            for (const fileName of fileArr) {
                // reference: http://shuheikagawa.com/blog/2015/09/21/using-highlight-js-with-marked/
                marked.setOptions({
                    langPrefix: 'hljs ',
                    highlight(code) {
                        return hljs.highlightAuto(code).value;
                    },
                });

                mainContent = marked(fs.readFileSync(path.join(this.postRoot, `${fileName}.md`), 'utf8'));

                ejs.renderFile(path.join(this.ejsRoot, Constants.EJS_POST),
                    { site: this.siteConfig, theme: this.themeConfig, contents: mainContent },
                    (renderPostError: Error, data: string) => {
                        if (renderPostError) reject(renderPostError);

                        ejs.renderFile(this.layoutPath,
                            { site: this.siteConfig, theme: this.themeConfig, contents: data },
                            (renderPageError: Error, output: string) => {
                                if (renderPageError) reject(renderPageError);

                                this.renderPage(Date.now().toString());
                            });
                    });
            }

            resolve();
        });
    }

    private renderPage(dirName: string, createDir: boolean = true): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (createDir) fs.mkdir(dirName);

            ejs.renderFile(this.layoutPath,
                        { site: this.siteConfig, theme: this.themeConfig, contents: mainContent },
                        (renderError: Error, data: string) => {
                            if (renderError) reject(renderError);

                            resolve();
                        });
        });
    }
}

export default EjsParser;
