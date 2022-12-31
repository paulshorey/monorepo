/**
 * Fixes key so that it is sanitized (no special characters, no uppercase)
 * @param key {string}
 * @returns {string}
 */
// let DEBUG2 = false
export default function (key = "") {
  /*
   * str
   */
  return key.toLowerCase().replace(/[^\ \d\w]+/g, "")
}
