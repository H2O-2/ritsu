declare class EjsParser {
    private fileRoot;
    private outputPath;
    constructor(fileRoot: string, outputPath: string);
    private renderFile(filePath);
}
export default EjsParser;
