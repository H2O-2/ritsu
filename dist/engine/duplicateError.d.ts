export default class DuplicateError extends Error {
    readonly dirName: string;
    constructor(message: string, dirName: string);
}
