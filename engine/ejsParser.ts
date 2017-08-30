// Parse ejs to html string

import * as chalk from 'chalk';
import * as ejs from 'ejs';
import * as fs from 'fs-extra';
import * as hljs from 'highlight.js';
import * as marked from 'marked';
import * as path from 'path';

import Constants from './constants';
import SiteConfig from './SiteConfig';
import ThemeConfig from './ThemeConfig';

class EjsParser {
    private ejsRoot: string;
    private postRoot: string;
    private generatePath: string;
    private siteConfig: SiteConfig;
    private themeConfig: ThemeConfig;
    private layoutPath: string;

    constructor(ejsRoot: string, postRoot: string, generatePath: string,
                siteConfig: SiteConfig, themeConfig: ThemeConfig) {
        this.ejsRoot = ejsRoot;
        this.postRoot = postRoot;
        this.generatePath = generatePath;
        this.siteConfig = siteConfig;
        this.themeConfig = themeConfig;
        this.layoutPath = path.join(this.ejsRoot, Constants.EJS_LAYOUT);
    }

    public render(fileArr: string[]): Promise<void> {
        return fs.mkdir(path.join(this.generatePath, this.siteConfig.postDir))
        .then(() => this.renderPost(fileArr))
        .then(() => this.renderHeader())
        .then(() => this.renderPage(Constants.EJS_INDEX, this.generatePath, true))
        .then(() =>
            this.renderPage(Constants.EJS_ARCHIVE, path.join(this.generatePath, this.siteConfig.archiveDir), true));
    }

    private renderHeader(): Promise<void[]> {
        // reference:
        // https://stackoverflow.com/questions/10687099/how-to-test-if-a-url-string-is-absolute-or-relative
        // Render all extra pages defined in header in theme-config.yaml.
        const isAbsolute: RegExp = new RegExp('^(?:[a-z]+:)?//', 'i');
        const headers = this.themeConfig.header;
        const headerPromiseArr: Array<Promise<void>> = [];

        for (const headName in headers) {
            if (headers.hasOwnProperty(headName)) {
                const headLink: string = path.join(this.generatePath, headers[headName]);

                headerPromiseArr.push(
                    fs.pathExists(headLink)
                    .then((exists) => {
                        if (exists || isAbsolute.test(headers[headName])) return;

                        return this.renderPage(`${headName.toLowerCase()}.ejs`, headLink, true);
                    }),
                );
            }
        }

        return Promise.all(headerPromiseArr);
    }

    private renderPost(fileArr: string[]): Promise<void[]> {
        // reference: http://shuheikagawa.com/blog/2015/09/21/using-highlight-js-with-marked/
        marked.setOptions({
            langPrefix: 'hljs ',
            highlight(code) {
                return hljs.highlightAuto(code).value;
            },
        });

        const renderPromiseArr: Array<Promise<void>> = [];

        let mainContent: string;

        for (const fileName of fileArr) {
            renderPromiseArr.push(
                fs.readFile(path.join(this.postRoot, `${fileName}.md`), 'utf8')
                .then((fileStr: string) => {
                    mainContent = marked(fileStr);
                })
                .then(() => this.renderFile(path.join(this.ejsRoot, Constants.EJS_POST),
                    { site: this.siteConfig, theme: this.themeConfig, contents: mainContent }))
                .then((postHtml: string) => this.renderPage(postHtml,
                        path.join(this.generatePath, this.siteConfig.postDir, Date.now().toString()), false)));
        }

        return Promise.all(renderPromiseArr);
    }

    private renderPage(ejsData: string, dirName: string, inputFile: boolean, createDir: boolean = true): Promise<void> {
        let mainContent: string;

        return fs.pathExists(dirName)
        .then((exists) => {
            if (!exists && createDir) fs.mkdirSync(dirName);
        })
        .then(() => process.chdir(this.ejsRoot))
        .then(() => {
            if (inputFile && !fs.pathExistsSync(ejsData))
                throw new Error(`Please create ${chalk.cyan(ejsData)} first.`);
            else if (inputFile)
                mainContent = fs.readFileSync(ejsData, 'utf8'); // ejsData as file path
            else
                mainContent = ejsData; // ejsData as EJS or HTML string
        })
        .then(() => this.renderFile(this.layoutPath,
            { site: this.siteConfig, theme: this.themeConfig, contents: mainContent }))
        .then((htmlStr: string) => fs.writeFile(path.join(dirName, Constants.DEFAULT_HTML_NAME), htmlStr));
    }

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
    private renderFile(filePath: string, data: ejs.Data): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            ejs.renderFile(filePath, data, (renderError: Error, htmlStr: string) => {
                if (renderError) reject(renderError);

                resolve(htmlStr);
            });
        });
    }
}

export default EjsParser;
