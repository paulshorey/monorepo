/**
 * Quick easy unique hash generator.
 * Not secure or cryptographic.
 * Good for generating IDs from text.
 * Like when entering a new blog or content into a database, when you want to keep your content unique,
 * you can do `let post_id = str_hash(post.author+post.title+post.body)`.
 */
export default function str_hash(str: string): string {
  let hash = 0;
  if (str.length === 0) {
    return hash + "";
  }
  for (let i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash + "";
}
