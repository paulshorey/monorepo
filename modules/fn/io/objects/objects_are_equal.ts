/**
 * Check objects deeply equal - have same content?
 * NOTE: If property is a function, then it is checked by reference.
 * @returns {boolean} - true if equal
 */
export default function objects_are_equal(object1: Record<any, any>, object2: Record<any, any>): boolean {
  const objKeys1 = object1 && Object.keys(object1);
  const objKeys2 = object2 && Object.keys(object2);

  if (objKeys1?.length !== objKeys2?.length) return false;

  for (var key of objKeys1) {
    const value1 = object1[key];
    const value2 = object2[key];

    const isObjects = value1 != null && typeof value1 === "object" && value2 != null && typeof value2 === "object";

    if ((isObjects && !objects_are_equal(value1, value2)) || (!isObjects && value1 !== value2)) {
      return false;
    }
  }
  return true;
}
