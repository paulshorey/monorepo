/**
 * Is array? And not empty?
 */
export default function (variable: any): boolean {
  return !!variable && typeof variable === "object" && Array.isArray(variable) && variable.length > 0;
}
