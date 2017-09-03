export interface HeaderObj extends Object {
    header: string;
    [header: string]: any;
}
export default interface ThemeConfig {
    postPerPage: number;
    isIndex: boolean;
    header: HeaderObj;
    autoComment: boolean;
    share: string[];
}
