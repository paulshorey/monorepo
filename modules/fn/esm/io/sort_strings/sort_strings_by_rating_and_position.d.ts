type SortRatings = Record<string, number> | {};
/**
 * Sort array of strings by separate dictionary of ratings and
 * also by position in array. Items at front of array will be rated higher.
 */
export default function sort_strings_by_rating_and_position(
/**
 * array of strings to be sorted
 */
arr: Array<string>, 
/**
 * dictionary of {string:rating}
 *      ratings does not have to contain an entry for each arr item
 *          if missing, will be given default 0
 *      likewise, it may contain more entries than arr,
 *          extras will be ignored
 */
ratings: SortRatings, 
/**
 * make position x times more important than rating (default 1)
 *     It's kind of backwards - Make it less than 1 to make rating more important. 0.5 is a good start. Just need to try it until you get a good value. In a very long list, ok to make it 0.1 or even 0.01.
 */
multiply_position?: number, 
/**
 * By default, this function will modify the arr, using arr.sort(). Set `true` to make this a pure function.
 */
immutable?: boolean): Array<string>;
export {};
