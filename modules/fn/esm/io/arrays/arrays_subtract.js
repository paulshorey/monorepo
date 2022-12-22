/**
 * Subtract array B values from array A. Return remaining array A. Expects 2 parameters, each an array.
 *      NOTE: first array A must be the main one. Words also appearing in B will be removed
 * @param a {array} - values we care about. Analyze these, compared to b
 * @param b {array} - for comparison only. Array values unique to B will be ignored
 * @returns {array} - returns an array of values which appear in A but not B
 */
export default function arrays_subtract(a = [], b = []) {
    return a.filter(function (i) {
        return !b.includes(i);
    });
}
