/**
 * Quick easy unique hash generator.
 * Not secure or cryptographic.
 * Good for generating IDs from text.
 * Like when entering a new blog or content into a database, when you want to keep your content unique,
 * you can do `let post_id = str_hash(post.author+post.title+post.body)`.
 */
export default function str_hash(str: string): string;
