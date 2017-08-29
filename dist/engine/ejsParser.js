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
class EjsParser {
    constructor(ejsRoot, postRoot, generatePath, siteConfig, themeConfig) {
        this.ejsRoot = ejsRoot;
        this.postRoot = postRoot;
        this.generatePath = generatePath;
        this.siteConfig = siteConfig;
        this.themeConfig = themeConfig;
        this.layoutPath = path.join(this.ejsRoot, constants_1.default.EJS_LAYOUT);
    }
    render(fileArr) {
        return fs.mkdir(path.join(this.generatePath, this.siteConfig.postDir))
            .then(() => this.renderPost(fileArr))
            .then(() => this.renderHeader())
            .then(() => this.renderPage(constants_1.default.EJS_INDEX, this.generatePath, false))
            .then(() => this.renderPage(constants_1.default.EJS_ARCHIVE, path.join(this.generatePath, this.siteConfig.archiveDir)));
    }
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
                    if (exists || isAbsolute.test(headers[headName]))
                        return;
                    return this.renderPage(`${headName.toLowerCase()}.ejs`, headLink);
                }));
            }
        }
        return Promise.all(headerPromiseArr);
    }
    renderPost(fileArr) {
        // reference: http://shuheikagawa.com/blog/2015/09/21/using-highlight-js-with-marked/
        marked.setOptions({
            langPrefix: 'hljs ',
            highlight(code) {
                return hljs.highlightAuto(code).value;
            },
        });
        const renderPromiseArr = [];
        let mainContent;
        for (const fileName of fileArr) {
            renderPromiseArr.push(fs.readFile(path.join(this.postRoot, `${fileName}.md`), 'utf8')
                .then((fileStr) => {
                mainContent = marked(fileStr);
            })
                .then(() => this.renderFile(path.join(this.ejsRoot, constants_1.default.EJS_POST), { site: this.siteConfig, theme: this.themeConfig, contents: mainContent }))
                .then((postHtml) => this.renderPage(this.layoutPath, path.join(this.generatePath, this.siteConfig.postDir, Date.now().toString()))));
        }
        return Promise.all(renderPromiseArr);
        // return new Promise<void>((resolve, reject) => {
        //     const contentArr: string[] = [];
        //     let mainContent: string;
        //     try {
        //         for (const fileName of fileArr) {
        //             // reference: http://shuheikagawa.com/blog/2015/09/21/using-highlight-js-with-marked/
        //             marked.setOptions({
        //                 langPrefix: 'hljs ',
        //                 highlight(code) {
        //                     return hljs.highlightAuto(code).value;
        //                 },
        //             });
        //             mainContent = marked(fs.readFileSync(path.join(this.postRoot, `${fileName}.md`), 'utf8'));
        //             ejs.renderFile(path.join(this.ejsRoot, Constants.EJS_POST),
        //                 { site: this.siteConfig, theme: this.themeConfig, contents: mainContent },
        //                 (renderPostError: Error, data: string) => {
        //                     if (renderPostError) reject(renderPostError);
        //                     ejs.renderFile(this.layoutPath,
        //                         { site: this.siteConfig, theme: this.themeConfig, contents: data },
        //                         (renderPageError: Error, output: string) => {
        //                             if (renderPageError) reject(renderPageError);
        //                             const curTime = Date.now().toString();
        //                             this.renderPage(curTime, path.join(this.generatePath, curTime));
        //                         });
        //                 });
        //         }
        //         resolve();
        //     } catch (e) {
        //         reject(e);
        //     }
        // });
    }
    renderPage(ejsFile, dirName, createDir = true) {
        return fs.pathExists(dirName)
            .then((exists) => {
            if (!exists && createDir)
                fs.mkdirSync(dirName);
        })
            .then(() => process.chdir(this.ejsRoot))
            .then(() => fs.pathExists(ejsFile))
            .then((exists) => {
            if (!exists)
                throw new Error(`Please create ${chalk.cyan(ejsFile)} first.`);
        })
            .then(() => this.renderFile(this.layoutPath, { site: this.siteConfig, theme: this.themeConfig, contents: fs.readFileSync(ejsFile, 'utf8') }))
            .then((htmlStr) => fs.writeFile(path.join(dirName, constants_1.default.DEFAULT_HTML_NAME), htmlStr));
        // return new Promise<void>((resolve, reject) => {
        //     if (createDir) fs.mkdirSync(dirName);
        //     process.chdir(this.ejsRoot);
        //     ejs.renderFile(this.layoutPath,
        //         { site: this.siteConfig, theme: this.themeConfig, contents: fs.readFileSync(ejsFile, 'utf8') },
        //         (renderError: Error, data: string) => {
        //             if (renderError) reject(renderError);
        //             fs.writeFileSync(path.join(dirName, Constants.DEFAULT_HTML_NAME), data);
        //             resolve();
        //     });
        // });
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
                if (renderError)
                    reject(renderError);
                resolve(htmlStr);
            });
        });
    }
}
exports.default = EjsParser;
