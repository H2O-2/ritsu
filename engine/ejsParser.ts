// Parse ejs to html string

import * as Ejs from 'ejs';
import * as path from 'path';

class EjsParser {
    private fileRoot: string;
    private outputPath: string;

    constructor(fileRoot: string, outputPath: string) {
        this.fileRoot = fileRoot;
    }

    private renderFile(filePath: string): void {
        Ejs.renderFile(path.join(this.fileRoot, filePath), (err: Error, data: string) => {
            if (err) throw err.message;
        });
    }
}

export default EjsParser;
