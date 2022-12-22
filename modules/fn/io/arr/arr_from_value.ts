/**
 * Create an array
 */
export default function arr_from_value(value: any, len: number): Array<any> {
  let arr: Array<any> = [];
  for (let i = 0; i < len; i++) {
    arr.push(value);
  }
  return arr;
}
