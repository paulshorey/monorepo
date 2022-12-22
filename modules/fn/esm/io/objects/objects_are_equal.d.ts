/**
 * Check objects deeply equal - have same content?
 * NOTE: If property is a function, then it is checked by reference.
 * @returns {boolean} - true if equal
 */
export default function objects_are_equal(object1: Record<any, any>, object2: Record<any, any>): boolean;
