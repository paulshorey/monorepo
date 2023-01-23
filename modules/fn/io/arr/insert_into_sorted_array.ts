import binary_search from "./binary_search";

/**
 * Insert into array using binary search
 * WARNING: This mutates the array
 */
export default function <T extends string | number>(array: T[], value: T): void {
  let index = binary_search(array, value, 0, array.length - 1);
  if (index >= 0) {
    array.splice(index, 0, value);
  }
}
