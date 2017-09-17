export interface HeaderObj extends Object {
    header: string;
    [header: string]: any;
}

export default interface ThemeConfig {
    styleEntry: string;
    sidebarBg: string;
    useBack: boolean;
    postPerPage: number;
    isIndex: boolean;
    header: HeaderObj;
    share: string[];
    [key: string]: any;
}
