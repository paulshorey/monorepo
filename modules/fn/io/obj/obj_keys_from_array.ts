/**
 * Create an object from array. Object's keys will made from Array's values.
 *    Use this to filter an array, keep only unique values, and maybe make something of them.
 *    This might be faster than using ES6 `[...new Set(...arr)]`, because it loops only once.
 * @param {array} arr - array values will be used, keys ignored
 * @param {*} value - any value to assign to each new item in object. Default value = true.
 * @returns {object} - from array values. Duplicate array values have been removed.
 */
export default function obj_keys_from_array(arr: Array<any>, value: any = true): Record<any, any> {
  let obj = {};
  for (let key of arr) {
    obj[key] = value;
  }
  return obj;
}
