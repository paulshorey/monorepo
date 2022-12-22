/**
 * Is array?
 */
export default function is_arr(variable: any): boolean {
  return variable && typeof variable === "object" && Array.isArray(variable);
}
