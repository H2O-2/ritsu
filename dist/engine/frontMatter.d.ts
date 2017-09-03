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
    static parsePost(postPath: string): Promise<FrontMatterObj>;
}
