/**
 * Similarities between arrays A and B
 * @returns - array of values which appear in both A and B
 */
export default function arr_includes(a: Array<any> = [], b: Array<any> = []): Array<any> {
  return a.filter(function (i) {
    return b.includes(i);
  });
}
