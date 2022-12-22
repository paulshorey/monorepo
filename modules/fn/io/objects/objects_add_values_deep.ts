/**
 * ADDS VALUES INSTEAD OF SIMPLY REPLACING.
 * WARNING: This is experimental. Watch out for circular references!
 * Should work fine for simple objects. But with React, watch out for props.children.
 * If strings, adds. If arrays, pushes second one to first. If numbers, replaces with 2nd.
 * If booleans, prefers true.
 * If objects, merges deeply, doing the same to all its properties.
 */
export default function objects_add_values_deep(val1: any, val2: any, stringDelimeter: string = ""): any {
  // The order of each if statement is important.
  if (!val1 && !val1) return null; // What is the ideal way to handle this?
  if (!val1 && val2) return val2;
  if (val1 && !val2) return val1;
  if (typeof val1 === "string" || typeof val2 === "string") {
    return val1 + stringDelimeter + val2;
  }
  if (typeof val1 !== typeof val2) {
    return val2 || val1;
  }
  if (typeof val1 === "number") {
    return val1 + val2;
  }
  if (typeof val1 === "boolean") {
    return val2 || val1;
  }
  if (Array.isArray(val1)) {
    return val1.concat(val2);
  }
  if (typeof val1 === "object") {
    let obj = {};
    let keys = [...new Set([...Object.keys(val1), ...Object.keys(val2)])];
    for (let key of keys) {
      obj[key] = objects_add_values_deep(val1[key], val2[key]);
    }
    return obj;
  }
  if (typeof val1 === "function") {
    return val2;
  }
}
