import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';

export interface FrontMatterObj {
    title: string;
    tags: string[];
    description?: string;
    headImg?: string;
}

/**
 *
 * Operations related to front matter.
 *
 * @class FrontMatter
 */
export default class FrontMatter {
    // reference: https://github.com/hexojs/hexo-front-matter/blob/master/lib/front_matter.js
    public static readonly splitRegex: RegExp = /(-{3,})\n([\s\S]+?)\n(?:$|\n([\s\S]*)$)/;

    /**
     *
     * Parse the front matter of a specific post.
     *
     * @static
     * @param {string} postName
     * @returns {FrontMatterObj}
     * @memberof FrontMatter
     */
    public static parseFrontMatter(postPath: string): Promise<string | object | FrontMatterObj | undefined> {
        return fs.readFile(postPath, 'utf8')
        .then((postStr: string) => {
            const frontMatterStr: RegExpMatchArray|null = postStr.match(this.splitRegex);

            if (!frontMatterStr)
                throw new Error(`Where's the front matter of post ${chalk.black.underline(postPath)} →_→ ?`);

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
    public static parsePost(postPath: string): Promise<string> {
        return fs.readFile(postPath, 'utf8')
        .then((postStr: string) => {
            const frontMatterStr: RegExpMatchArray|null = postStr.match(this.splitRegex);

            if (!frontMatterStr)
                throw new Error(`Where's the front matter of post ${chalk.black.underline(postPath)} →_→ ?`);

            let postPart: string = frontMatterStr[3];

            if (postPart && postPart[0] === '-') postPart = postPart.substr(3, postPart.length);

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
    public static parsePostStr(postPath: string): string {
        const frontMatterStr: RegExpMatchArray|null = fs.readFileSync(postPath, 'utf8').match(this.splitRegex);

        if (!frontMatterStr)
            throw new Error(`Where's the front matter of post ${chalk.black.underline(postPath)} →_→ ?`);

        let postPart: string = frontMatterStr[3];

        if (postPart[0] === '-') postPart = postPart.substr(3, postPart.length);

        return postPart;
    }
}
