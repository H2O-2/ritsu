export default interface Post {
    fileName: string;
    urlName: string; // file name with unsafe chars replaced
    title: string;
    date: number; // Unix Timestamp (miliseconds)
    formatedDate: string;
    tags: string[];
    description: string;

    pageUrl: string; // name of the directory of posts, default to 'posts' in site-config.yaml
    prevPost: string|null;
    nextPost: string|null;
}
