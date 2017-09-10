import Post from './post';
export default interface Archive extends Object {
    title: string;
    posts: Post[][];
}
