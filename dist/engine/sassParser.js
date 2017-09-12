"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const sass = require("node-sass");
const path = require("path");
const constants_1 = require("./constants");
class SassParser {
    constructor(sassRoot, cssRoot, siteConfig, themeConfig) {
        this.sassRoot = sassRoot;
        this.cssRoot = cssRoot;
        this.fileArr = fs.readdirSync(this.sassRoot);
        this.siteConfig = siteConfig;
        this.themeConfig = themeConfig;
    }
    render() {
        return this.renderSass(fs.readFileSync(path.join(this.sassRoot, this.themeConfig.styleEntry), 'utf8'))
            .then((cssData) => fs.writeFile(path.join(this.cssRoot, constants_1.default.DIST_FILE), cssData, { encoding: 'utf8' }))
            .then(() => this.moveRes(0))
            .catch((e) => { throw e; });
    }
    moveRes(fileIndex) {
        if (fileIndex >= this.fileArr.length)
            return new Promise((resolve) => resolve());
        const fileName = this.fileArr[fileIndex];
        const curFile = path.join(this.sassRoot, fileName);
        return fs.pathExists(curFile)
            .then((exists) => {
            if (!exists)
                throw new Error(`${curFile} does not exist.`);
        })
            .then(() => {
            const extName = path.extname(curFile);
            if (extName !== '.sass' && extName !== '.scss' && extName !== '.css') {
                fs.copySync(curFile, path.join(this.cssRoot, fileName));
            }
            return this.moveRes(fileIndex + 1);
        })
            .catch((e) => { throw e; });
    }
    renderSass(sassData) {
        return new Promise((resolve, reject) => {
            sass.render({
                data: sassData,
                includePaths: [this.sassRoot],
                outputStyle: 'compressed',
                sourceMap: true,
                functions: {
                    "site-config($field)": (field) => {
                        return new sass.types.String(this.siteConfig[field.getValue()]);
                    },
                    "theme-config($field)": (field) => {
                        return new sass.types.String(this.themeConfig[field.getValue()]);
                    },
                },
            }, (err, result) => {
                if (err)
                    reject(err);
                resolve(result.css.toString());
            });
        });
    }
    readThemeConfig(field) {
        return new sass.types.String();
    }
}
exports.default = SassParser;
