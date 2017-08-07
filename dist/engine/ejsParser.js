"use strict";
// Parse ejs to html string
Object.defineProperty(exports, "__esModule", { value: true });
var Ejs = require("ejs");
var path = require("path");
var EjsParser = (function () {
    function EjsParser(fileRoot, outputPath) {
        this.fileRoot = fileRoot;
    }
    EjsParser.prototype.renderFile = function (filePath) {
        Ejs.renderFile(path.join(this.fileRoot, filePath), function (err, data) {
            if (err)
                throw err;
        });
    };
    return EjsParser;
}());
exports.default = EjsParser;
