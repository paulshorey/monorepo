/**
 * Find all differences between 2 arrays. What values in either one are NOT contained in the other.
 * @returns - returns an array of values which only appear once, not in both arrays
 */
export default function arrays_diff(a: Array<any> = [], b: Array<any> = []): Array<any> {
  let combined = a.concat(b);
  return combined.filter((el) => {
    if (!a.includes(el) || !b.includes(el)) return el;
  });
}
