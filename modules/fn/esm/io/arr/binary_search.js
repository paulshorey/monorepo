/**
 * Binary search O(log n)
 * @returns {number} index to splice the value into
 */
export default function binary_search(array, value, low, high) {
    if (low > high) {
        return low;
    }
    let mid = Math.floor((low + high) / 2);
    if (
    // @ts-ignore // I need help with this honestly - why Typescript complains that array[mid] may be a number even after I've explicitly checked for type string?
    (typeof array[mid] === "string" && array[mid].localeCompare(value) < 0) ||
        (typeof array[mid] === "number" && array[mid] < value)) {
        return binary_search(array, value, mid + 1, high);
    }
    else {
        return binary_search(array, value, low, mid - 1);
    }
}
