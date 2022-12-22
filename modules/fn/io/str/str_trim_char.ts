/**
 * Trim a character other than whitespace
 * @param s {string} - string
 * @param c {string} - remove this character (or characters) from start/end
 * @returns {void | string}
 */
export default function str_trim_char(s, c) {
  if (c === "]") c = "\\]";
  if (c === "\\") c = "\\\\";
  return s.replace(new RegExp("^[" + c + "]+|[" + c + "]+$", "g"), "");
}
