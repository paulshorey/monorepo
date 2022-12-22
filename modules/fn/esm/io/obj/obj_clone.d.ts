/**
 * ADDS VALUES INSTEAD OF SIMPLY REPLACING.
 * If strings, adds. If arrays, pushes second one to first. If numbers, replaces with 2nd.
 * If booleans, prefers true.
 * If objects, merges deeply, doing the same to all its properties.
 * This is called obj_clone not simply add_values, because this is only useful for adding object types.
 */
export default function obj_clone(obj: any): any;
