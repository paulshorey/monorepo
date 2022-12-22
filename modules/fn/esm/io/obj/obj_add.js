/**
 * False if not an object, or key is not a property of the object.
 */
export default function obj_add(obj, key, value) {
    try {
        obj[key] = value;
    }
    catch (_a) { }
}
