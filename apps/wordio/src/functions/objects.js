/**
 * Sort array of objects by property
 *    NOTE: this is just like _.sortBy() but can only sort by one property instead of multiple
 *    This is simply a simplified copy of `sort_objects_by_property_and_position()`
 *    ```
 *      let list = [{name:'Pasha',age:8}, {name:'Masha',age:9}]
 *      sort_objects_by_property(list, 'age') // Masha will move up to first place
 *    ```
 *    Like `sort_objects_by_property_and_position()`, but without caring about the position.
 *    NOTE: your original array will be modified. Use [...arr] destructuring to keep immutable.
 * @param arr {Array.<Object>} - array of objects to be sorted
 * @param prop1_key {string} - property to use, to sort by. Each object in array must contain this key
 * @param prop1_asc {boolean} - by default, will sort DESC, but if this is true, will sort ASC
 * @param immutable {boolean} - Set this to `true` to make this a pure function, and immutable.
 *    Otherwise, THIS IS NOT A PURE FUNCTION. By default it modifies the original array.
 * @return {Array.<Object>} - array of objects, sorted
 */
export const sort_objects_by_property = function (
  arr,
  prop1_key,
  prop1_asc = false,
  immutable = false,
) {
  if (!arr) return [];
  if (immutable) arr = [...arr];
  return arr.sort(sort_objects_by_property__helper.bind({ arr, prop1_key, prop1_asc }));
};

// helper function:
function sort_objects_by_property__helper(a, b) {
  // sort by rating
  let a_rating = a[this.prop1_key];
  let b_rating = b[this.prop1_key];
  // sort order
  if (this.prop1_asc) {
    // prefer lower number
    // if b is lower, then rate it better than a
    return a_rating - b_rating;
  } else {
    // prefer higher number
    // if b is higher, then rate it better than a
    return b_rating - a_rating;
  }
}
