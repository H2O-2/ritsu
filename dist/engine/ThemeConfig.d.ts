export interface HeaderObj extends Object {
    header: string;
    [header: string]: any;
}
export default interface ThemeConfig {
    postPerPage: number;
    header: HeaderObj;
    autoComment: boolean;
    share: string[];
}
