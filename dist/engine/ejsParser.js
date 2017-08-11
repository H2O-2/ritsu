"use strict";
// Parse ejs to html string
Object.defineProperty(exports, "__esModule", { value: true });
const Ejs = require("ejs");
const path = require("path");
class EjsParser {
    constructor(fileRoot, outputPath) {
        this.fileRoot = fileRoot;
    }
    renderFile(filePath) {
        Ejs.renderFile(path.join(this.fileRoot, filePath), (err, data) => {
            if (err)
                throw err.message;
        });
    }
}
exports.default = EjsParser;
