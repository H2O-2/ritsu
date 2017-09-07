// Parse ejs to html string

import * as chalk from 'chalk';
import * as ejs from 'ejs';
import * as fs from 'fs-extra';
import * as hljs from 'highlight.js';
import * as marked from 'marked';
import * as path from 'path';

import Constants from './constants';
import FrontMatter from './frontMatter';
import Page from './page';
import Post from './post';
import SiteConfig from './SiteConfig';
import ThemeConfig from './ThemeConfig';

class EjsParser {
    private rootPath: string;
    private ejsRoot: string;
    private postRoot: string;
    private generatePath: string;
    private themePath: string;
    private postArr: Post[];
    private siteConfig: SiteConfig;
    private themeConfig: ThemeConfig;
    private layoutPath: string;
    private readonly defaultRenderData: ejs.Data;

    constructor(rootPath: string, postRoot: string, generatePath: string, themePath: string, postArr: Post[],
                siteConfig: SiteConfig, themeConfig: ThemeConfig) {
        this.rootPath = rootPath;
        this.postRoot = postRoot;
        this.generatePath = generatePath;
        this.themePath = themePath;
        this.ejsRoot = path.join(this.themePath, Constants.DEFAULT_THEME, Constants.EJS_DIR);
        this.postArr = postArr;
        this.siteConfig = siteConfig;
        this.themeConfig = themeConfig;
        this.layoutPath = path.join(this.ejsRoot, Constants.EJS_LAYOUT);

        this.defaultRenderData = {
            site: this.siteConfig,
            theme: this.themeConfig,
        };

        // reference: http://shuheikagawa.com/blog/2015/09/21/using-highlight-js-with-marked/
        marked.setOptions({
            langPrefix: 'hljs ',
            highlight(code) {
                return hljs.highlightAuto(code).value;
            },
        });
    }

    /**
     *
     * Render all EJS files.
     *
     * @param {string[]} fileArr
     * @returns {Promise<void>}
     * @memberof EjsParser
     */
    public render(): Promise<void> {
        return fs.mkdir(path.join(this.generatePath, this.siteConfig.postDir))
        .then(() => this.renderPost())
        .then(() => this.renderHeader())
        .then(() => this.pagination(this.postArr, 1))
        // .then(() => this.renderPage(Constants.EJS_ARCHIVE, path.join(this.generatePath, this.siteConfig.archiveDir),
        //             true, false))
        .catch((e: Error) => { throw e; });
    }

    /**
     *
     * Render all pages that header links directs to.
     *
     * @private
     * @returns {Promise<void[]>}
     * @memberof EjsParser
     */
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
                        if (!exists && !isAbsolute.test(headers[headName])) {
                            const headerData = this.defaultRenderData;
                            headerData.page = { title: headName };

                            return this.renderPage(path.join(this.themePath, Constants.CUSTOM_HEADER_DIR,
                                                    `${headName.toLowerCase()}.ejs`), headerData, headLink,
                                                    true, false);
                        }
                    }),
                );
            }
        }

        return Promise.all(headerPromiseArr);
    }

    /**
     *
     * Render all post pages.
     *
     * @private
     * @param {string[]} fileArr
     * @param {number} [fileIndex=0]
     * @returns {Promise<void>}
     * @memberof EjsParser
     */
    private renderPost(fileIndex: number = 0): Promise<void> {
        const curPost: Post = this.postArr[fileIndex];
        let postData: ejs.Data;

        return FrontMatter.parsePost(path.join(this.postRoot, `${curPost.fileName}.md`))
        .then((fileStr: string) => marked(fileStr))
        .then((mainContent: string) => {
            postData = {
                site: this.siteConfig,
                theme: this.themeConfig,
                contents: mainContent,
                isIndex: false,
                page: curPost,
            };

            return this.renderFile(path.join(this.ejsRoot, Constants.EJS_POST), postData);
        })
        .then((postHtml: string) =>
            this.renderPage(postHtml, postData,
                            path.join(this.generatePath, curPost.pageUrl, curPost.urlName), false, false))
        .then(() => {
            if (fileIndex < this.postArr.length - 1) {
                return this.renderPost(fileIndex + 1);
            }
        });
    }

    private pagination(postArr: Post[], page: number, first: boolean = true): Promise<void> {
        const posts: Post[] = postArr;
        const indexData: ejs.Data = this.defaultRenderData;
        const pagePosts: Post[] = posts.splice(0, this.themeConfig.postPerPage);
        const newPage: Page = {
            pageNum: page,
            postArr: pagePosts,
            lastPage: posts.length === 0,
            pageUrl: this.siteConfig.pageDir,
        };

        indexData.page = newPage;

        return this.renderFile(Constants.EJS_INDEX, indexData)
        .then((indexContent: string) => {

            if (first)
                this.renderPage(indexContent, indexData, this.generatePath, false, true);
            else {
                this.renderPage(indexContent, indexData,
                    path.join(this.generatePath, this.siteConfig.pageDir, page.toString()), false, true);
            }
        })
        .then(() => {
            if (posts.length > 0) {
                if (first) fs.mkdirSync(path.join(this.generatePath, this.siteConfig.pageDir));

                this.pagination(posts, page + 1, false);
            }
        })
        .catch((e: Error) => { throw e; });
    }

    /**
     *
     * Render a page in folder `dirName` or in root directory of publish (index.html)
     *
     * @private
     * @param {string} ejsData
     * @param {string} dirName
     * @param {boolean} inputFile
     * @param {boolean} isIndexPage
     * @param {boolean} [createDir=true]
     * @returns {Promise<void>}
     * @memberof EjsParser
     */
    private renderPage(ejsData: string, renderData: ejs.Data, dirName: string, inputFile: boolean, isIndexPage: boolean,
                       createDir: boolean = true): Promise<void> {
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
        .then(() => {
            const customRender: ejs.Data = renderData;

            customRender.contents = mainContent;
            customRender.isIndex = isIndexPage;
            customRender.postNum = this.postArr.length;

            return this.renderFile(this.layoutPath, customRender);
        })
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
                if (renderError) {
                    reject(renderError);
                } else {
                    resolve(htmlStr);
                }
            });
        });
    }
}

export default EjsParser;
