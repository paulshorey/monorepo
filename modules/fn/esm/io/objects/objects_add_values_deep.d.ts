/**
 * ADDS VALUES INSTEAD OF SIMPLY REPLACING.
 * WARNING: This is experimental. Watch out for circular references!
 * Should work fine for simple objects. But with React, watch out for props.children.
 * If strings, adds. If arrays, pushes second one to first. If numbers, replaces with 2nd.
 * If booleans, prefers true.
 * If objects, merges deeply, doing the same to all its properties.
 */
export default function objects_add_values_deep(val1: any, val2: any, stringDelimeter?: string): any;
