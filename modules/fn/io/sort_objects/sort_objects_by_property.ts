/**
 * Sort array of objects by property
 *    NOTE: this is just like _.sortBy() but can only sort by one property instead of multiple
 *    This is simply a simplified copy of `sort_objects_by_property_and_position()`
 *    Like `sort_objects_by_property_and_position()`, but without caring about the position.
 * @param arr - array of objects to be sorted
 * @param prop1_key - property to use, to sort by. Each object in array must contain this key
 * @param prop1_desc {boolean} - by default, will sort ASC, but if this is true, will sort DESC
 * @return - array of objects, sorted
 */
export default function sort_objects_by_property(
  arr: Array<Record<any, any>>,
  prop1_key: any,
  prop1_desc: boolean = false
): Array<Record<any, any>> {
  if (!arr) return [];
  arr = [...arr];
  return arr.sort(sort_objects_by_property__helper.bind({ arr, prop1_key, prop1_desc }));
}
// helper function:
function sort_objects_by_property__helper(a, b) {
  // sort by rating
  let a_rating = a[this.prop1_key];
  let b_rating = b[this.prop1_key];
  // sort order
  if (!this.prop1_desc) {
    // prefer lower number
    // if b is lower, then rate it better than a
    return a_rating - b_rating;
  } else {
    // prefer higher number
    // if b is higher, then rate it better than a
    return b_rating - a_rating;
  }
}
