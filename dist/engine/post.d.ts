export default interface Post {
    fileName: string;
    urlName: string;
    title: string;
    date: number;
    formatedDate: string;
    year: string;
    day: string;
    tags: string[];
    description: string;
    headImg: string | null;
    pageUrl: string;
    prevPost: string | null;
    nextPost: string | null;
}
