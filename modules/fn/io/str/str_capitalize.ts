/**
 * Capitalize each word in a string. A word is any sequence of characters separated by a space.
 */
export default function str_capitalize(string: string): string {
  return string.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}
