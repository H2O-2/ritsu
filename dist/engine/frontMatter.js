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
            let frontMatter = frontMatterStr[2];
            frontMatter = frontMatter.substr(0, frontMatter.length - 3);
            return yaml.safeLoad(frontMatter);
        });
    }
    /**
     *
     * Remove front matter and return the content of the post.
     *
     * @static
     * @param {string} postPath
     * @returns {Promise<string>}
     * @memberof FrontMatter
     */
    static parsePost(postPath) {
        return fs.readFile(postPath, 'utf8')
            .then((postStr) => {
            const frontMatterStr = postStr.match(this.splitRegex);
            if (!frontMatterStr)
                throw new Error(`Where\'s the front matter of post ${chalk.black.underline(postPath)} →_→ ?`);
            let postPart = frontMatterStr[3];
            if (postPart && postPart[0] === '-')
                postPart = postPart.substr(3, postPart.length);
            return postPart;
        });
    }
    /**
     *
     * Same as parsePost() but returns string instead.
     *
     * @static
     * @param {string} postPath
     * @returns {string}
     * @memberof FrontMatter
     */
    static parsePostStr(postPath) {
        const frontMatterStr = fs.readFileSync(postPath, 'utf8').match(this.splitRegex);
        if (!frontMatterStr)
            throw new Error(`Where\'s the front matter of post ${chalk.black.underline(postPath)} →_→ ?`);
        let postPart = frontMatterStr[3];
        if (postPart[0] === '-')
            postPart = postPart.substr(3, postPart.length);
        return postPart;
    }
}
// reference: https://github.com/hexojs/hexo-front-matter/blob/master/lib/front_matter.js
FrontMatter.splitRegex = /(-{3,})\n([\s\S]+?)\n(?:$|\n([\s\S]*)$)/;
exports.default = FrontMatter;
