/**
 * ADDS VALUES INSTEAD OF SIMPLY REPLACING.
 * If strings, adds. If arrays, pushes second one to first. If numbers, replaces with 2nd.
 * If booleans, prefers true.
 * If objects, merges deeply, doing the same to all its properties.
 * This is called objects_add_values not simply add_values, because this is only useful for adding object types.
 */
export default function objects_add_values(val1: any, val2: any, stringDelimeter?: string, removeKeys?: Array<string>, addKeys?: Array<string>, key?: string): any;
