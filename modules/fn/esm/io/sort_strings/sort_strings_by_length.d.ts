/**
 * Sort input array by number of characters in string (or number cast to string)
 * Will sort ASC by default. Pass second parameter to sort by DESC.
 * @param {array} arr - expects array of strings,
 *       but will also accept array of anything,
 *       will cast any child to string `arr[i].toString()`
 * @param {boolean} desc - sort descending?
 *       if false or undefined, will be sorted ascending
 * @returns {array} arr - also modifies original array to returned value!
 */
export default function sort_strings_by_length(arr: Array<string>, desc?: boolean): Array<string>;
