/**
 * Calls a function on each item in array (like [].forEach but works with Promises)
 *    Returns a Promise which resolves when all your promises are done processing.
 *    NOTE: unlike Promise.all, this does not crash on rejected Promises
 *    NOTE: your responses may not come back in the same order as they were sent
 * @param array - array with any type of values
 * @param fn - a function which returns a Promise
 *    each value from array will be fed into the fn, all executed concurrently
 */
export default function arr_each_promise_all(array: Array<any>, fn: Function): Promise<any>;
