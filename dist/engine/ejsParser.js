"use strict";
// Parse ejs to html string
Object.defineProperty(exports, "__esModule", { value: true });
const ejs = require("ejs");
const path = require("path");
class EjsParser {
    constructor(ejsRoot, siteConfig, themeConfig) {
        this.ejsRoot = ejsRoot;
        this.siteConfig = siteConfig;
        this.themeConfig = themeConfig;
    }
    render(mainContent) {
        return new Promise((resolve, reject) => {
            ejs.renderFile(path.join(this.ejsRoot, 'layout.ejs'), { site: this.siteConfig, theme: this.themeConfig, contents: mainContent }, (renderError, data) => {
                if (renderError)
                    reject(new Error(renderError.message));
                resolve(data);
            });
        });
    }
}
exports.default = EjsParser;
