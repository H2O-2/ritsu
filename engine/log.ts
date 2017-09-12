import * as chalk from 'chalk';

export default class Log {
    /**
     * Logs errors with the string 'ERROR:' at the fronnt
     *
     * @static
     * @param {string} msg
     * @memberof Log
     */
    public static logErr(msg: string|void): void {
        Log.log(chalk.bgRed.black('ERROR:'), msg);
    }

    /**
     * Logs general informations.
     *
     * @static
     * @param {string} msg
     * @memberof Log
     */
    public static logInfo(msg: string): void {
        Log.log(chalk.bgGreen.white(msg));
    }

    /**
     *
     * Log without chalk.js
     *
     * @static
     * @param {string} msg
     * @memberof Log
     */
    public static logPlain(msg: string): void {
        Log.log(msg);
    }

    private static log = console.log;
}
