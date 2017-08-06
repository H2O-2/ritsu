// Parse ejs to html string

import * as Ejs from 'ejs';
import * as path from 'path';

class EjsParser {
    private filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    public compile() {
        Ejs.renderFile(path.join(__dirname, this.filePath), (err: Error, data: string) => {
            console.log(err || data);
        });
    }
}

export default EjsParser;
