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
export default function sort_strings_by_width(arr: Array<string>, desc?: boolean): Array<string>;
