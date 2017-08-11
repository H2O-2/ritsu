"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
class Log {
    /**
     * Logs errors with the string 'ERROR:' at the fronnt
     *
     * @static
     * @param {string} msg
     * @memberof Log
     */
    static logErr(msg) {
        Log.log(chalk.bgRed('ERROR:'), msg);
    }
    /**
     * Logs general informations.
     *
     * @static
     * @param {string} msg
     * @memberof Log
     */
    static logInfo(msg) {
        Log.log(chalk.bgGreen.black(msg));
    }
}
Log.log = console.log;
exports.default = Log;