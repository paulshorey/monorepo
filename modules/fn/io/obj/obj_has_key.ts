import is_obj from "./is_obj";

/**
 * False if not an object, or key is not a property of the object.
 */
export default function obj_has_key(obj: any, key: any): any {
  return is_obj(obj) && obj.hasOwnProperty(key);
}
