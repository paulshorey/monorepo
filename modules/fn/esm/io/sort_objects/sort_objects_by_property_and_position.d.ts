/**
 * Sort array of strings by separate dictionary of [{string:rating},], and
 * also by position in array. Items at front of array will be rated higher.
 */
export default function (
/**
 * array of strings to be sorted
 */
arr: Array<Record<any, any>>, 
/**
 * which property of object to use as sort rating (its value must be a number)
 */
rating_key: any, 
/**
 * make position x times more important than rating (default 1)
 *     It's kind of backwards - Make it less than 1 to make rating more important. 0.5 is a good start. Just need to try it until you get a good value. In a very long list, ok to make it 0.1 or even 0.01.
 */
multiply_position?: number): Array<Record<any, any>>;
