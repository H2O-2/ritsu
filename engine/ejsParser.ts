// Parse ejs to html string

import * as path from 'path';

import * as Ejs from 'ejs';

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
