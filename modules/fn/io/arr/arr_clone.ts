/**
 * Deep copy an array
 * @param {array} arr
 * @returns {array}
 */
export default function arr_clone(arr: Array<any>): Array<any> {
  return arr.map((item) => (Array.isArray(item) ? arr_clone(item) : item));
}
