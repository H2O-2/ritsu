"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
class Log {
    static logErr(msg) {
        Log.log(chalk.bgRed('ERROR:'), msg);
    }
    static logInfo(msg) {
        Log.log(chalk.bgGreen.black(msg));
    }
}
Log.log = console.log;
exports.default = Log;
