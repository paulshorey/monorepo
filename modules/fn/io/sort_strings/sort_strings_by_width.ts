import word_width from "../word/word_width";

/**
 * Sort input array NOT JUST by number of characters in string (like sort_strings_by_length),
 * but instead, sort by width of the "word".
 *       Skinny letters like "i" and "l" will be sorted higher (if asc).
 *       Wide letters like "w" and "m" will be sorted lower (if asc).
 *       To sort wider strings higher, set `desc` to `true`.
 * @param {array} arr - expects array of strings,
 *       but will also accept array of anything,
 *       will cast any child to string `arr[i].toString()`
 * @param {boolean} desc - sort descending?
 *       if false or undefined, will be sorted ascending
 * @returns {array} arr - also modifies original array to returned value!
 */
export default function sort_strings_by_width(arr: Array<string>, desc: boolean = false): Array<string> {
  arr = [...arr];
  let sort_func = help_sort_strings_by_width.bind({ desc });
  return arr.sort(sort_func);
}
function help_sort_strings_by_width(a, b) {
  let desc = this.desc;
  let a_width = word_width(JSON.stringify(a || ""));
  let b_width = word_width(JSON.stringify(b || ""));
  if (desc) {
    return b_width - a_width;
  }
  return a_width - b_width;
}
