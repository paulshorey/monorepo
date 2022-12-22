/**
 * Parse JSON variable - recursively
 * @param value - Any variable type
 * @returns - Intelligently parsed value. Will convert "4" to number type, "false" to boolean, etc.
 * NOTE: JSON can not stringify ES6 types Set and Map. Stringify/parse, changes value to empty object.
 * As a workaround, before stringifying, convert Set to Array, and Map to Array of tuples.
 */
export default function json_parse(value: any): Record<any, any> | string | boolean | number | null | undefined;
