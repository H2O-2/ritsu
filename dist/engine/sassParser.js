"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sass = require("node-sass");
class SassParser {
    constructor(sassRoot) {
        this.sassRoot = sassRoot;
    }
    render(mainContent, file) {
        return new Promise((resolve, reject) => {
            sass.render({
                data: mainContent,
                outFile: file,
                outputStyle: 'compressed',
                sourceMap: true,
            }, (err, result) => {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
    }
}
