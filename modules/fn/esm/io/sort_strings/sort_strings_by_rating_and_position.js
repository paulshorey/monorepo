/**
 * Sort array of strings by separate dictionary of ratings and
 * also by position in array. Items at front of array will be rated higher.
 */
export default function sort_strings_by_rating_and_position(
/**
 * array of strings to be sorted
 */
arr, 
/**
 * dictionary of {string:rating}
 *      ratings does not have to contain an entry for each arr item
 *          if missing, will be given default 0
 *      likewise, it may contain more entries than arr,
 *          extras will be ignored
 */
ratings, 
/**
 * make position x times more important than rating (default 1)
 *     It's kind of backwards - Make it less than 1 to make rating more important. 0.5 is a good start. Just need to try it until you get a good value. In a very long list, ok to make it 0.1 or even 0.01.
 */
multiply_position = 1, 
/**
 * By default, this function will modify the arr, using arr.sort(). Set `true` to make this a pure function.
 */
immutable = false) {
    if (!arr)
        return [];
    arr = [...arr];
    let that = { ratings, indexes: {}, multiply_position };
    // ratings
    for (let str in ratings) {
        let rate = ratings[str] || 0;
        // compare ratings to each other
        if (that.min_rating === undefined || rate < that.min_rating) {
            that.min_rating = rate;
        }
        if (that.max_rating === undefined || rate > that.max_rating) {
            that.max_rating = rate;
        }
    }
    // @ts-ignore - min_rating and max_rating are set above // tsFix - check for edge cases when set to 0
    that.delta_rating = that.max_rating - that.min_rating;
    // @ts-ignore - min_rating and max_rating are set above // tsFix - check for edge cases when set to 0
    that.median_rating = that.min_rating + that.delta_rating / 2;
    // prepare position indexes
    that.min_index = 0;
    that.max_index = arr.length - 1;
    for (let i in arr) {
        // count up - first item = 0, last item = (length-1)
        let string = arr[i];
        that.indexes[string] = i;
    }
    that.delta_index = that.max_index - that.min_index;
    // sort
    return arr.sort(sort_strings_by_rating_and_position__helper.bind(that));
}
/**
 * Array.sort() function
 */
function sort_strings_by_rating_and_position__helper(a, b) {
    // higher == better
    // normalized to 0-1 range
    // highest rating gets 1, lowest rating gets 0
    let a_rating = (this.delta_rating -
        (this.max_rating - (typeof this.ratings[a] !== "undefined" ? this.ratings[a] : this.median_rating))) /
        this.delta_rating;
    let b_rating = (this.delta_rating -
        (this.max_rating - (typeof this.ratings[b] !== "undefined" ? this.ratings[b] : this.median_rating))) /
        this.delta_rating;
    // higher == better
    // normalized to 0-1 range
    // lowest index gets 1, highest index gets 0
    // (multiply_position to make position score more important than rating score)
    let a_index = ((this.max_index - this.indexes[a]) / this.delta_index) * this.multiply_position;
    let b_index = ((this.max_index - this.indexes[b]) / this.delta_index) * this.multiply_position;
    // combine the two
    // if b is higher, then sort it closer to front of array compared to a
    return b_rating + b_index - (a_rating + a_index);
}
