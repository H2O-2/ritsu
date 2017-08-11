import * as chalk from 'chalk';

export default class Log {
    public static logErr(msg: string): void {
        Log.log(chalk.bgRed('ERROR:'), msg);
    }

    public static logInfo(msg: string): void {
        Log.log(chalk.bgGreen.black(msg));
    }

    private static log = console.log;
}
