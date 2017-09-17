"use strict";
// Parse ejs to html string
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const ejs = require("ejs");
const fs = require("fs-extra");
const hljs = require("highlight.js");
const marked = require("marked");
const path = require("path");
const constants_1 = require("./constants");
const frontMatter_1 = require("./frontMatter");
class EjsParser {
    constructor(rootPath, postRoot, generatePath, themePath, postArr, siteConfig, themeConfig) {
        this.rootPath = rootPath;
        this.postRoot = postRoot;
        this.generatePath = generatePath;
        this.themePath = themePath;
        this.ejsRoot = path.join(this.themePath, constants_1.default.DEFAULT_THEME, constants_1.default.EJS_DIR);
        this.postArr = postArr;
        this.siteConfig = siteConfig;
        this.themeConfig = themeConfig;
        this.layoutPath = path.join(this.ejsRoot, constants_1.default.EJS_LAYOUT);
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
    render() {
        return fs.mkdir(path.join(this.generatePath, this.siteConfig.postDir))
            .then(() => this.renderArchive())
            .then(() => this.renderPost())
            .then(() => this.renderHeader())
            .then(() => this.pagination(JSON.parse(JSON.stringify(this.postArr)), 1))
            .catch((e) => { throw e; });
    }
    update() {
        return this.renderArchive()
            .then(() => this.renderPost())
            .then(() => this.pagination(JSON.parse(JSON.stringify(this.postArr)), 1))
            .catch((e) => { throw e; });
    }
    /**
     *
     * Render all pages that header links directs to.
     *
     * @private
     * @returns {Promise<void[]>}
     * @memberof EjsParser
     */
    renderHeader() {
        // reference:
        // https://stackoverflow.com/questions/10687099/how-to-test-if-a-url-string-is-absolute-or-relative
        // Render all extra pages defined in header in theme-config.yaml.
        const isAbsolute = new RegExp('^(?:[a-z]+:)?//', 'i');
        const headers = this.themeConfig.header;
        const headerPromiseArr = [];
        for (const headName in headers) {
            if (headers.hasOwnProperty(headName)) {
                const headLink = path.join(this.generatePath, headers[headName]);
                headerPromiseArr.push(fs.pathExists(headLink)
                    .then((exists) => {
                    if (!exists && !isAbsolute.test(headers[headName])) {
                        const headerData = this.defaultRenderData;
                        headerData.page = {
                            title: headName,
                            canonical: `/${headName.toLowerCase()}/`,
                            fileName: headName,
                        };
                        return this.renderPage(path.join(this.themePath, constants_1.default.CUSTOM_HEADER_DIR, `${headName.toLowerCase()}.ejs`), headerData, headLink, true, false);
                    }
                }));
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
    renderPost(fileIndex = 0) {
        const curPost = this.postArr[fileIndex];
        let postData;
        return frontMatter_1.default.parsePost(path.join(this.postRoot, `${curPost.fileName}.md`))
            .then((fileStr) => marked(fileStr))
            .then((mainContent) => {
            postData = {
                site: this.siteConfig,
                theme: this.themeConfig,
                contents: mainContent,
                isIndex: false,
                page: curPost,
            };
            return this.renderFile(path.join(this.ejsRoot, constants_1.default.EJS_POST), postData);
        })
            .then((postHtml) => this.renderPage(postHtml, postData, path.join(this.generatePath, curPost.pageUrl, curPost.urlName), false, false))
            .then(() => {
            if (fileIndex < this.postArr.length - 1) {
                return this.renderPost(fileIndex + 1);
            }
        });
    }
    /**
     *
     * Implements pagination of index page.
     *
     * @private
     * @param {Post[]} postArr
     * @param {number} page
     * @param {boolean} [first=true]
     * @returns {Promise<void>}
     * @memberof EjsParser
     */
    pagination(postArr, page, first = true) {
        const posts = postArr;
        const indexData = this.defaultRenderData;
        const pagePosts = posts.splice(0, this.themeConfig.postPerPage);
        const newPage = {
            pageNum: page,
            postArr: pagePosts,
            lastPage: posts.length === 0,
            pageUrl: this.siteConfig.pageDir,
            canonical: page > 1 ? `/${this.siteConfig.pageDir}/${page}/` : '/',
        };
        indexData.page = newPage;
        return this.renderFile(path.join(this.ejsRoot, constants_1.default.EJS_INDEX), indexData)
            .then((indexContent) => {
            if (first)
                this.renderPage(indexContent, indexData, this.generatePath, false, true);
            else {
                this.renderPage(indexContent, indexData, path.join(this.generatePath, this.siteConfig.pageDir, page.toString()), false, true);
            }
        })
            .then(() => {
            if (posts.length > 0) {
                const pageDir = path.join(this.generatePath, this.siteConfig.pageDir);
                if (first && !fs.pathExistsSync(pageDir))
                    fs.mkdirSync(pageDir);
                this.pagination(posts, page + 1, false);
            }
        })
            .catch((e) => { throw e; });
    }
    /**
     *
     * Render archive page.
     *
     * @private
     * @returns {Promise<void>}
     * @memberof EjsParser
     */
    renderArchive() {
        const archiveData = this.defaultRenderData;
        const initPosts = [[this.postArr[0]]];
        const page = {
            title: 'Archive',
            posts: initPosts,
            canonical: `/${this.siteConfig.archiveDir}/`,
        };
        for (let i = 1; i < this.postArr.length; i++) {
            const post = this.postArr[i];
            const curYear = post.year;
            if (curYear !== page.posts[page.posts.length - 1][0].year) {
                page.posts.push(new Array());
            }
            page.posts[page.posts.length - 1].push(post);
        }
        archiveData.page = page;
        return this.renderFile(path.join(this.ejsRoot, constants_1.default.EJS_ARCHIVE), archiveData)
            .then((archiveStr) => {
            this.renderPage(archiveStr, archiveData, path.join(this.generatePath, this.siteConfig.archiveDir), false, false);
        });
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
    renderPage(ejsData, renderData, dirName, inputFile, isIndexPage, createDir = true) {
        let mainContent;
        return fs.pathExists(dirName)
            .then((exists) => {
            if (!exists && createDir)
                fs.mkdirSync(dirName);
        })
            .then(() => {
            if (inputFile && !fs.pathExistsSync(ejsData))
                throw new Error(`Please create ${chalk.cyan(ejsData)} first.`);
            else if (inputFile)
                mainContent = fs.readFileSync(ejsData, 'utf8'); // ejsData as file path
            else
                mainContent = ejsData; // ejsData as EJS or HTML string
        })
            .then(() => {
            const customRender = renderData;
            customRender.contents = mainContent;
            customRender.isIndex = isIndexPage;
            customRender.postNum = this.postArr.length;
            return this.renderFile(this.layoutPath, customRender);
        })
            .then((htmlStr) => fs.writeFile(path.join(dirName, constants_1.default.DEFAULT_HTML_NAME), htmlStr));
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
    renderFile(filePath, data) {
        return new Promise((resolve, reject) => {
            ejs.renderFile(filePath, data, (renderError, htmlStr) => {
                if (renderError) {
                    reject(renderError);
                }
                else {
                    resolve(htmlStr);
                }
            });
        });
    }
}
exports.default = EjsParser;
