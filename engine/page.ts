import Post from './post';

export default interface Page {
    pageNum: number;
    postArr: Post[];
    lastPage: boolean;
    pageUrl: string;
    canonical: string;
}
