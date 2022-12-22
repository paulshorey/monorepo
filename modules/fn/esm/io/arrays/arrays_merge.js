/**
 * Combines two arrays of strings, one item from each array at a time, into new array. Ignores duplicates.
 * Like taking two decks of cards, and making one double deck, by taking one card at a time from each deck.
 * @param arr1 - array of strings
 * @param arr2 - array of strings
 * @return - array of strings, combined from both arrays
 */
export default function arrays_merge(arr1, arr2) {
    if (!arr1 && !arr2)
        return [];
    if (!arr1 && arr2)
        return arr2;
    if (arr1 && !arr2)
        return arr1;
    let set = new Set();
    /*
     * setup pointers (will be incremented each time new item is taken from array)
     */
    let ai = {};
    for (let i in arguments) {
        // will be incremented (ai[i]++) before each use
        ai[i] = -1; // on first use will === 0
    }
    /*
     * iterate all passed-in arrays, one by one, take one new item at a time
     */
    for (let y = 0; y < 50; y++) {
        for (let i in arguments) {
            let arr = arguments[i];
            let str = arr[ai[i]++];
            if (str) {
                set.add(str);
            }
        }
    }
    // console.log('sort_strings_combine_lists list', list);
    return [...set];
    // return arr1;
}
