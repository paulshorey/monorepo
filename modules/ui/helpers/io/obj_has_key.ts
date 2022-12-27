/**
 * Checks if variable is a real object.
 * @returns {boolean} - true if a real object
 */
const is_obj = function (variable: any): boolean {
  if (
    typeof variable === 'object' &&
    variable !== null &&
    !Array.isArray(variable)
  ) {
    return true;
  }
  return false;
};

/**
 * False if not an object, or key is not a property of the object.
 */
export default function obj_has_key(obj: any, key: any): any {
  return is_obj(obj) && obj.hasOwnProperty(key);
}
