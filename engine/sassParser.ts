import * as sass from 'node-sass';

class SassParser {
    public readonly sassRoot: string;

    constructor(sassRoot: string) {
        this.sassRoot = sassRoot;
    }

    public render(mainContent: string, file: string): Promise<sass.Result> {
        return new Promise<sass.Result>((resolve, reject) => {
            sass.render({
                data: mainContent,
                outFile: file,
                outputStyle: 'compressed',
                sourceMap: true,
            }, (err: sass.SassError, result: sass.Result) => {
                if (err) reject(err);

                resolve(result);
            });
        });
    }
}
