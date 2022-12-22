/**
 *
 * @param row {object}
 * @param row.key {string} - sanitized str (either key or str required)
 * @param row.str {string} - un-sanitized key, with punctuation (either key or str required)
 * @param row.pos1 {string} - 3-letter part of speech (optional, but highly recommended)
 * @returns {object}
 */
declare const row_model: (row: any) => any;
export default row_model;
