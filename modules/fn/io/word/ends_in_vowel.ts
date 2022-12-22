/**
 * Checks if a word ends in a vowel (including silent e).
 */
export default function ends_in_vowel(str: string): boolean {
  return ["a", "e", "i", "o", "u", "y"].includes(str[str.length - 1]);
}
