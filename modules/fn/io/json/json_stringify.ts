/**
 * Simply wraps JSON.stringify() with a try/catch block. Returns empty string if error.
 */
export default function (val: any): string {
  try {
    return JSON.stringify(val);
  } catch (e) {
    return "";
  }
}
