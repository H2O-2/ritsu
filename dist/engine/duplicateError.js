"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DuplicateError extends Error {
    constructor(message, dirName) {
        super(message);
        this.dirName = dirName;
    }
}
exports.default = DuplicateError;
