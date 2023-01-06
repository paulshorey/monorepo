/**
 * @returns {Array} - Array of each line from the error stack
 */
export default function parse_error_stack(response: any): string[] {
  if (!response || !(response instanceof Error) || !response.stack) return [];
  /*
   * If input is a JavaScript Error object, that's easy! Just return the first 2 lines of the stack.
   */
  return response.stack?.split("\n");
}
