export default class Log {
    /**
     * Logs errors with the string 'ERROR:' at the fronnt
     *
     * @static
     * @param {string} msg
     * @memberof Log
     */
    static logErr(msg: string): void;
    /**
     * Logs general informations.
     *
     * @static
     * @param {string} msg
     * @memberof Log
     */
    static logInfo(msg: string): void;
    /**
     *
     * Log without chalk.js
     *
     * @static
     * @param {string} msg
     * @memberof Log
     */
    static logPlain(msg: string): void;
    private static log;
}
