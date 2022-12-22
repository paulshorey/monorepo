/**
 * Check if string is only one letter, and is a vowel?
 */
export default function is_vowel(str: string): boolean {
  return ["a", "e", "i", "o", "u", "y", "A", "E", "I", "O", "U", "Y"].includes(str);
}
