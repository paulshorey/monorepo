/**
 * Checks if variable is a real object.
 * @returns {boolean} - true if a real object
 */
export default function is_obj(variable: any): boolean {
  if (typeof variable === "object" && variable !== null && !Array.isArray(variable)) {
    return true;
  }
  return false;
}
