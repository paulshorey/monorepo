/**
 * Remove an item (if exact match string/number) from array
 */
export default function arr_remove_item(arr = [], item) {
    return arr.filter((it) => it !== item);
}
