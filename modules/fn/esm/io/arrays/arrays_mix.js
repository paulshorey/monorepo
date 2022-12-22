/**
 * Mixes multiple lists into one list, by taking one item at a time from each and pushing it to new array.
 */
export default function arrays_mix(arrays) {
    let master_list = [];
    // find length of longest array
    let max_length = 0;
    for (let arr of arrays) {
        max_length = Math.max(arr.length, max_length);
    }
    // iterate by index
    // check item at each index in each array
    let index = 0;
    while (true) {
        // add one item from each array
        for (let arr of arrays) {
            if (arr[index]) {
                // add item if exists
                master_list.push(arr[index]);
            }
        }
        // next index
        index++;
        if (index >= max_length) {
            break;
        }
    }
    return master_list;
}
