/**
 * Algorithm sort = by string length + by current position in array
 *     NEEDS REFACTOR: does [].sort() twice!
 * @param arr - array of strings
 * @param prefer_position - number to multiply position rating, to make it more important than length
 * @param fix_min_length - absolute minimum allowed to be used as min_length (default 4)
 *      ex: if 4, algorithm will treat str.length of 2,3,4 the same
 */
export default function sort_strings_by_length_and_position(arr: Array<string>, 
/**
 * make position x times more important than rating (default 1)
 *     It's kind of backwards - Make it less than 1 to make rating more important. 0.5 is a good start. Just need to try it until you get a good value. In a very long list, ok to make it 0.1 or even 0.01.
 */
prefer_position?: number, fix_min_length?: number): Array<string>;
