import sort_strings_by_length from "./sort_strings_by_length";
type SortThat = {
  min_length?: number;
  max_length?: number;
  delta_position?: number;
  min_position?: number;
  max_position?: number;
  arr_positions?: Record<string, number>;
  prefer_position?: number;
  delta_length?: number;
  fix_min_length?: number;
};

/**
 * Algorithm sort = by string length + by current position in array
 *     NEEDS REFACTOR: does [].sort() twice!
 * @param arr - array of strings
 * @param prefer_position - number to multiply position rating, to make it more important than length
 * @param fix_min_length - absolute minimum allowed to be used as min_length (default 4)
 *      ex: if 4, algorithm will treat str.length of 2,3,4 the same
 */
export default function sort_strings_by_length_and_position(
  arr: Array<string>,
  /**
   * make position x times more important than rating (default 1)
   *     It's kind of backwards - Make it less than 1 to make rating more important. 0.5 is a good start. Just need to try it until you get a good value. In a very long list, ok to make it 0.1 or even 0.01.
   */
  prefer_position: number = 1,
  fix_min_length: number = 0
): Array<string> {
  if (!arr || !arr.length) return [];
  arr = [...arr];
  try {
    // prepare ratings by length
    let ascending = sort_strings_by_length([...arr]);
    // prepare ratings by position
    let arr_positions = {};
    for (let i in arr) {
      let string = arr[i];
      arr_positions[string] = i;
    }
    // compile ratings
    // ${this} in [].sort()
    let that: SortThat = {
      min_length: ascending[0].length || 0,
      max_length: ascending[ascending.length - 1].length || 0,
      min_position: 0,
      max_position: arr.length,
      delta_position: arr.length,
      arr_positions: arr_positions,
      prefer_position: prefer_position
    };
    // ${this} fix & finish
    if (fix_min_length) {
      that.fix_min_length = fix_min_length;
      that.min_length = fix_min_length;
    }
    // @ts-ignore - min_rating and max_rating are set above // tsFix - check for edge cases when set to 0
    that.delta_length = that.max_length - that.min_length;
    // done
    return arr.sort(sort_strings_by_length_and_position_asc__helper.bind(that));
  } catch (e) {
    console.error("invalid input array to sort_strings_by_length_and_position()");
    return arr;
  }
}

// helper function:
function sort_strings_by_length_and_position_asc__helper(a, b) {
  // if length is less than absolute minimum, use absolute minimum
  let a_length = a.length;
  let b_length = b.length;
  if (this.fix_min_length) {
    if (a.length < this.fix_min_length) a_length = this.fix_min_length;
    if (b.length < this.fix_min_length) b_length = this.fix_min_length;
  }
  // lower number == good (prefer shorter words)
  let a_rating_length = (a_length - this.min_length) / this.delta_length;
  let b_rating_length = (b_length - this.min_length) / this.delta_length;
  // lower number == good (lower index in array, so started closer to #1)
  let a_position_length = ((this.arr_positions[a] - this.min_position) / this.delta_position) * this.prefer_position;
  let b_position_length = ((this.arr_positions[b] - this.min_position) / this.delta_position) * this.prefer_position;
  // combine the two
  return a_rating_length + a_position_length - (b_rating_length + b_position_length);
}
