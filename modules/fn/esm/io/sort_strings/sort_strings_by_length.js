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
export default function sort_strings_by_length(arr, desc = false) {
    if (!arr || !arr.length)
        return [];
    arr = [...arr];
    let sort_func = help_sort_strings_by_length.bind({ desc });
    return arr.sort(sort_func);
}
/**
 * Usage: `[].sort(help_sort_strings_by_length)`
 * Note: NOT EXPORTED
 */
function help_sort_strings_by_length(a, b) {
    let desc = this.desc;
    if (desc) {
        return b.toString().length - a.toString().length;
    }
    return a.toString().length - b.toString().length;
}
