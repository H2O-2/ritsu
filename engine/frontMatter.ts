import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';

export interface FrontMatterObj {
    title: string;
    tags: string[];
}

/**
 *
 * Operations related to front matter.
 *
 * @class FrontMatter
 */
export default class FrontMatter {
    /**
     *
     * Parse the front matter of a specific post.
     *
     * @static
     * @param {string} postName
     * @returns {FrontMatterObj}
     * @memberof FrontMatter
     */
    public static parsePost(postPath: string): Promise<FrontMatterObj> {
        return fs.readFile(postPath, 'utf8')
        .then((postStr: string) => {
            const frontMatterStr: RegExpMatchArray|null = postStr.match(this.splitRegex);

            if (!frontMatterStr)
                throw new Error(`Where\'s the front matter of post ${chalk.black.underline(postPath)} →_→ ?`);

            return yaml.safeLoad(frontMatterStr[1]);
        });
    }

    private static readonly splitRegex: RegExp = /^\n*-{3,}\n([\s\S]+\n)+-{3,}\n/;
}
