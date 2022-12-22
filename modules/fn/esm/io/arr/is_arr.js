/**
 * Is array?
 */
export default function is_arr(variable) {
    return variable && typeof variable === "object" && Array.isArray(variable);
}
