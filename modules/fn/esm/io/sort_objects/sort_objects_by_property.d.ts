/**
 * Sort array of objects by property
 *    NOTE: this is just like _.sortBy() but can only sort by one property instead of multiple
 *    This is simply a simplified copy of `sort_objects_by_property_and_position()`
 *    Like `sort_objects_by_property_and_position()`, but without caring about the position.
 * @param arr - array of objects to be sorted
 * @param prop1_key - property to use, to sort by. Each object in array must contain this key
 * @param prop1_desc {boolean} - by default, will sort ASC, but if this is true, will sort DESC
 * @return - array of objects, sorted
 */
export default function sort_objects_by_property(arr: Array<Record<any, any>>, prop1_key: any, prop1_desc?: boolean): Array<Record<any, any>>;
