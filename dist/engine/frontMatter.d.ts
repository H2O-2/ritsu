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
    static readonly splitRegex: RegExp;
    /**
     *
     * Parse the front matter of a specific post.
     *
     * @static
     * @param {string} postName
     * @returns {FrontMatterObj}
     * @memberof FrontMatter
     */
    static parseFrontMatter(postPath: string): Promise<FrontMatterObj>;
    /**
     *
     * Remove front matter and return the content of the post.
     *
     * @static
     * @param {string} postPath
     * @returns {Promise<string>}
     * @memberof FrontMatter
     */
    static parsePost(postPath: string): Promise<string>;
    /**
     *
     * Same as parsePost() but returns string instead.
     *
     * @static
     * @param {string} postPath
     * @returns {string}
     * @memberof FrontMatter
     */
    static parsePostStr(postPath: string): string;
}
