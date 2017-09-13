export default class Constants {
    public static readonly POST_SUFFIX: string = '.md';
    public static readonly DB_FILE: string = '.db.json';
    public static readonly DEFAULT_SITE_CONFIG: string = 'site-config.yaml';
    public static readonly DEFAULT_THEME_CONFIG: string = 'theme-config.yaml';
    public static readonly DEFAULT_THEME: string = 'theme-notes';
    public static readonly DEFAULT_TEMPLATE: string = 'default';
    public static readonly DEFAULT_DIR_NAME: string = 'new-blog';
    public static readonly DEFAULT_GENERATE_DIR: string = 'publish';
    public static readonly CUSTOM_HEADER_DIR: string = 'custom';
    public static readonly GIT_REPO_THEME_NOTES: string = 'https://github.com/H2O-2/theme-notes.git';
    public static readonly DEFAULT_HTML_NAME: string = 'index.html';

    public static readonly EJS_DIR: string = 'view';
    public static readonly EJS_PART_DIR: string = 'parts';
    public static readonly EJS_INDEX: string = 'index.ejs';
    public static readonly EJS_LAYOUT: string = 'layout.ejs';
    public static readonly EJS_POST: string = 'post.ejs';
    public static readonly EJS_ARCHIVE: string = 'archive.ejs';

    public static readonly RES_DIR: string = 'res';
    public static readonly DIST_FILE: string = 'dist.css';

    public static readonly DEPLOY_DIR: string = '.deploy.git';
    public static readonly README_FILE: string = 'README.md';
}
