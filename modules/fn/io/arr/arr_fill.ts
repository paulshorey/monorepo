/**
 * Create a new array, and fill it with values (all same value)
 * @param {*} value - what value to assign to each item in array
 * @param {number} len - how long to make the array
 * @returns {array}
 */
export default function arr_fill(value: any, len: number): Array<any> {
  return new Array(len).fill(value);
}
