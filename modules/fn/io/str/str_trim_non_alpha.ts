/**
 * Trim all non-alphabetical (not a-zA-Z) characters
 * @param str {string} - string
 * @returns {string}
 */
export default function str_trim_non_alpha(str) {
  return str.replace(new RegExp("^[^a-z]+|[^a-z]+$", "gi"), "");
}
