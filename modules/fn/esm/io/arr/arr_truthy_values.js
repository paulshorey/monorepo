/**
 * Array with empty/falsy values removed.
 */
export default function arr_truthy_values(arr) {
    return arr.filter((val) => !!val);
}
