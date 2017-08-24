"use strict";
// Parse ejs to html string
Object.defineProperty(exports, "__esModule", { value: true });
const ejs = require("ejs");
const path = require("path");
const log_1 = require("./log");
class EjsParser {
    constructor(ejsRoot, siteConfig, themeConfig) {
        this.ejsRoot = ejsRoot;
        this.siteConfig = siteConfig;
        this.themeConfig = themeConfig;
    }
    render() {
        try {
            ejs.renderFile(path.join(this.ejsRoot, path.sep, 'layout.ejs'), { site: this.siteConfig, theme: this.themeConfig }, (renderError, data) => {
                return data;
            });
        }
        catch (renderError) {
            log_1.default.logErr(renderError.message);
        }
    }
}
exports.default = EjsParser;
