/**
 * Stores the options of site configurations. For details of the options see ./site-config.yaml.
 *
 * @interface SiteConfig
 */
export default interface SiteConfig {
    siteName: string;
    siteDescription?: string;
    author: string;
    siteIcon?: string;
    createTime: string;
    avatar?: string;
    personalPage?: string;
    theme: string;
    rootDir: string;
    archiveDir: string;
    postDir: string;
    templateDir: string;
    repoURL?: string;
    branch?: string;
    commitMsg?: string;
}
