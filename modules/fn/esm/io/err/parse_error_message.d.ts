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
export default function parse_error_message(response: any): string;
