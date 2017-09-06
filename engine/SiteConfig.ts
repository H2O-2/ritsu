/**
 * Stores the options of site configurations. For details of the options see ./site-config.yaml.
 *
 * @interface SiteConfig
 */
export default interface SiteConfig {
    // See site-config.yaml for details
    siteName: string;
    siteSubtitle: string;
    siteDescription?: string;
    author: string;
    authorDescription: string;
    siteIcon?: string;
    createTime: string;
    avatar?: string;
    personalPage?: string;
    og: Map<string, string>;

    theme: string;
    rootDir: string;
    pageDir: string;
    archiveDir: string;
    postDir: string;
    timeFormat: string;

    repoURL?: string;
    branch?: string;
    commitMsg?: string;

    [data: string]: any;
}
