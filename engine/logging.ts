import * as chalk from 'chalk';

export default class Log {
    /**
     * Logs errors with the string 'ERROR:' at the fronnt
     *
     * @static
     * @param {string} msg
     * @memberof Log
     */
    public static logErr(msg: string): void {
        Log.log(chalk.bgRed('ERROR:'), msg);
    }

    /**
     * Logs general informations.
     *
     * @static
     * @param {string} msg
     * @memberof Log
     */
    public static logInfo(msg: string): void {
        Log.log(chalk.bgGreen.black(msg));
    }

    private static log = console.log;
}
