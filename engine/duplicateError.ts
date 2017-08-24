export default class DuplicateError extends Error {
    public readonly dirName: string;

    constructor(message: string, dirName: string) {
        super(message);

        this.dirName = dirName;
    }
}
