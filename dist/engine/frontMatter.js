"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const fs = require("fs-extra");
const yaml = require("js-yaml");
/**
 *
 * Operations related to front matter.
 *
 * @class FrontMatter
 */
class FrontMatter {
    /**
     *
     * Parse the front matter of a specific post.
     *
     * @static
     * @param {string} postName
     * @returns {FrontMatterObj}
     * @memberof FrontMatter
     */
    static parseFrontMatter(postPath) {
        return fs.readFile(postPath, 'utf8')
            .then((postStr) => {
            const frontMatterStr = postStr.match(this.splitRegex);
            if (!frontMatterStr)
                throw new Error(`Where\'s the front matter of post ${chalk.black.underline(postPath)} →_→ ?`);
            return yaml.safeLoad(frontMatterStr[1]);
        });
    }
    static parsePost(postPath) {
        return fs.readFile(postPath, 'utf8')
            .then((postStr) => postStr.replace(this.splitRegex, ''));
    }
    static parsePostStr(postPath) {
        return fs.readFileSync(postPath, 'utf8').replace(this.splitRegex, '');
    }
}
FrontMatter.splitRegex = /^\n*-{3,}\n([\s\S]+\n)+-{3,}\n/;
exports.default = FrontMatter;
