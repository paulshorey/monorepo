/**
 * Just like in other programming languages, now possible with JavaScript. Use await keyword!
 * @param ms - milliseconds to sleep for
 */
export default function sleep(ms: number = 0): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
