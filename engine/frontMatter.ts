import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';

export interface FrontMatterObj {
    title: string;
    tags: string[];
    description?: string;
}

/**
 *
 * Operations related to front matter.
 *
 * @class FrontMatter
 */
export default class FrontMatter {
    public static readonly splitRegex: RegExp = /^\n*-{3,}\n([\s\S]+\n)+-{3,}\n/;

    /**
     *
     * Parse the front matter of a specific post.
     *
     * @static
     * @param {string} postName
     * @returns {FrontMatterObj}
     * @memberof FrontMatter
     */
    public static parseFrontMatter(postPath: string): Promise<FrontMatterObj> {
        return fs.readFile(postPath, 'utf8')
        .then((postStr: string) => {
            const frontMatterStr: RegExpMatchArray|null = postStr.match(this.splitRegex);

            if (!frontMatterStr)
                throw new Error(`Where\'s the front matter of post ${chalk.black.underline(postPath)} →_→ ?`);

            return yaml.safeLoad(frontMatterStr[1]);
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
        .then((postStr: string) => postStr.replace(this.splitRegex, ''));
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
        return fs.readFileSync(postPath, 'utf8').replace(this.splitRegex, '');
    }
}
