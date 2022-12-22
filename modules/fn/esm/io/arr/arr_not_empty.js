/**
 * Is array? And not empty?
 */
export default function (variable) {
    return !!variable && typeof variable === "object" && Array.isArray(variable) && variable.length > 0;
}
