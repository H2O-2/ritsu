import * as fs from 'fs-extra';
import * as sass from 'node-sass';
import * as path from 'path';

import Constants from './constants';
import SiteConfig from './SiteConfig';
import ThemeConfig from './ThemeConfig';

/**
 *
 * Parse Sass.
 *
 * @export
 * @class SassParser
 */
export default class SassParser {
    private sassRoot: string; // location of sass files
    private cssRoot: string; // output location of css files
    private fileArr: string[];
    private siteConfig: SiteConfig;
    private themeConfig: ThemeConfig;

    constructor(sassRoot: string, cssRoot: string, siteConfig: SiteConfig, themeConfig: ThemeConfig) {
        this.sassRoot = sassRoot;
        this.cssRoot = cssRoot;
        this.fileArr = fs.readdirSync(this.sassRoot);
        this.siteConfig = siteConfig;
        this.themeConfig = themeConfig;
    }

    /**
     *
     * Parses Sass files to a single css file and copy resources to res folder as well.
     * @returns {Promise<void>}
     * @memberof SassParser
     */
    public render(): Promise<void> {
        return this.renderSass(fs.readFileSync(path.join(this.sassRoot, this.themeConfig.styleEntry), 'utf8'))
        .then((cssData: string) =>
                fs.writeFile(path.join(this.cssRoot, Constants.DIST_FILE), cssData, { encoding: 'utf8' }))
        .then(() => this.moveRes(0))
        .catch((e: Error) => { throw e; });
    }

    /**
     *
     * Check recursively for non-style files and copy to res folder as resources.
     *
     * @private
     * @param {number} fileIndex
     * @returns {Promise<void>}
     * @memberof SassParser
     */
    private moveRes(fileIndex: number): Promise<void> {
        if (fileIndex >= this.fileArr.length) return new Promise((resolve) => resolve());

        const fileName = this.fileArr[fileIndex];
        const curFile = path.join(this.sassRoot, fileName);

        return fs.pathExists(curFile)
        .then((exists: boolean) => {
            if (!exists) throw new Error(`${curFile} does not exist.`);
        })
        .then(() => {
            const extName: string = path.extname(curFile);

            if (extName !== '.sass' && extName !== '.scss' && extName !== '.css') {
                fs.copySync(curFile, path.join(this.cssRoot, fileName));
            }

            return this.moveRes(fileIndex + 1);
        })
        .catch((e: Error) => { throw e; });
    }

    /**
     *
     * Render an Sass string.
     *
     * @private
     * @param {string} sassData
     * @returns {Promise<string>}
     * @memberof SassParser
     */
    private renderSass(sassData: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            sass.render({
                data: sassData,
                includePaths: [this.sassRoot],
                outputStyle: 'compressed',
                sourceMap: true,
                functions: {
                    "site-config($field)": (field: any) => {
                        return new sass.types.String(this.siteConfig[field.getValue()]);
                    },
                    "theme-config($field)": (field: any) => {
                        return new sass.types.String(this.themeConfig[field.getValue()]);
                    },
                },
            }, (err: Error, result: any) => {
                if (err) reject(err);

                resolve(result.css.toString());
            });
        });
    }
}
