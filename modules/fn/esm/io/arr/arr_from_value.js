/**
 * Create an array
 */
export default function arr_from_value(value, len) {
    let arr = [];
    for (let i = 0; i < len; i++) {
        arr.push(value);
    }
    return arr;
}
