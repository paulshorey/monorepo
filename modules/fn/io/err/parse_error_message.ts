import json_stringify from "../json/json_stringify";

/**
 * Parse simple message string from HTTP JSON response, GraphQL, or Error() object
 *
 * Too many libraries to fetch HTTP requests, too many non-standard response formats.
 * This handles Axios or standard XMLHTTPRequest, or an Error() object
 * Supports either convention, of Twitter or Facebook
 * Supports "non-legacy" format described in: https://www.mediawiki.org/wiki/API:Errors_and_warnings
 * Response and parsed error can be any type. This will figure it out, with just a few if/else rules.
 *
 * WARNING: This should NOT be used to detect if a variable is an error. It will be very slow.
 * Only use this to parse the message string from some object/response which you know contains an error message.
 *
 * @param response - response from HTTP request or JS Error object
 *
 * @returns {string} - nice readable text - to render in an alert popup in your front-end user interface
 */
export default function parse_error_message(response: any): string {
  if (!response) return "!error";
  /*
   * If input is a JavaScript Error object, that's easy! Just return the first 2 lines of the stack.
   */
  if (response instanceof Error && response.stack) {
    let str = "";
    let arr = response.stack?.split("\n");
    if (arr[0]) str += `'${arr[0].trim()}' `;
    if (arr[1]) str += arr[1].replace(/\/.+\/([^/]+)\/([^/]+)\//g, "$1/$2/").trim();
    return str;
  } else {
    /*
     * Else, parse the error message from the response (type any).
     */
    //
    // maybe input was a string, which is already an error message,
    // or null/undefined/false, whatever, just output that as is
    if (typeof response !== "object") return response.toString();
    //
    // content from HTTP response:
    let content = response.response
      ? response.response.data
        ? response.response.data
        : response.response
      : response.data || response;
    //
    // error object:
    let error = content;
    if (content.errors) error = content.errors[0] || content.errors;
    else if (content.warnings) error = content.warnings[0] || content.warnings;
    else if (content.error) error = content.error;
    else if (content.warning) error = content.warning;
    //
    // something weird:
    if (typeof error !== "object") return error.toString();
    //
    // JS Error object - cut off extra stuff about files/lines:
    if (error[0] && error[0].length > 3) return error[0];
    //
    // JSON object:
    if (error.message) return error.message;

    let str = json_stringify(error);
    let strlen = str.length;
    if (strlen > 23) {
      str = str.substring(0, 23) + "...";
    }
    return "Error " + strlen + ": " + str;
  }
}
