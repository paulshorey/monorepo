import is_obj from "./is_obj";
/**
 * Check if variable is valid object, and has keys. Returns false if not object, or has no keys.
 */
export default function obj_not_empty(obj) {
    if (!is_obj(obj)) {
        return false;
    }
    for (let key in obj) {
        // found a property. No need to keep looping.
        return true;
    }
    return false;
}
