/**
 * Remove an item (if exact match string/number) from array
 */
export default function arr_remove_item(arr: Array<any> = [], item: any): Array<any> {
  return arr.filter((it) => it !== item);
}
