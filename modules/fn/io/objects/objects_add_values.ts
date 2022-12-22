/**
 * ADDS VALUES INSTEAD OF SIMPLY REPLACING.
 * If strings, adds. If arrays, pushes second one to first. If numbers, replaces with 2nd.
 * If booleans, prefers true.
 * If objects, merges deeply, doing the same to all its properties.
 * This is called objects_add_values not simply add_values, because this is only useful for adding object types.
 */
export default function objects_add_values(
  val1: any,
  val2: any,
  stringDelimeter: string = "",
  removeKeys?: Array<string>,
  addKeys?: Array<string>,
  key?: string
): any {
  // The order of each if statement is important.
  if (val1 === undefined && val2 !== undefined) return val2;
  if (val1 !== undefined && val2 === undefined) return val1;
  if (typeof val1 !== typeof val2) {
    return val2;
  }
  if (val1 === val2 || typeof val2 === "boolean") return val2;
  if (typeof val1 === "number" || typeof val1 === "string" || typeof val2 === "string") {
    if (addKeys && key) {
      for (let addKey of addKeys) {
        if (key.substring(0, addKey.length) === addKey) {
          return val1 + stringDelimeter + val2;
        }
      }
    }
    return val2;
  }
  if (Array.isArray(val1)) {
    return val1.concat(val2);
  }
  if (typeof val1 === "object") {
    let obj = {};
    let keys = [...new Set([...Object.keys(val1), ...Object.keys(val2)])];
    for (let key of keys) {
      if (removeKeys && removeKeys.includes(key)) {
        continue;
      }
      obj[key] = objects_add_values(val1[key], val2[key], stringDelimeter, removeKeys, addKeys, key);
    }
    return obj;
  }
  if (typeof val1 === "function") {
    return val2;
  }
}
