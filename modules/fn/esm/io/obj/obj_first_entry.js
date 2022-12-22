/**
 * Return the first entry of an object, just like we sometimes do with an array.
 * @returns {Array} - [key, value]
 */
export default function obj_first_entry(obj) {
    for (let key in obj) {
        // doesn't loop, but that's the point!
        return [key, obj[key]];
    }
}
