/**
 * Returns the first value in an object, just like we sometimes do with an array.
 * @returns {any} - value
 */
export default function obj_first_value(obj) {
    for (let key in obj) {
        // doesn't loop, but that's the point!
        return obj[key];
    }
}
