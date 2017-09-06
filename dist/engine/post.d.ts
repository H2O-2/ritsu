export default interface Post {
    fileName: string;
    urlName: string;
    title: string;
    date: number;
    formatedDate: string;
    tags: string[];
    description: string;
    pageUrl: string;
    prevPost: string | null;
    nextPost: string | null;
}
