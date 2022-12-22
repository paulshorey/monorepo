/**
 * Parse and combine POST data and URL params into JavaScript object
 * @param req {object} - IMPORTANT: does not have to be real api request. Can be simple object.
 * @param req.body {object} - key/value pairs, already parsed and ready to use (ex: {options:{}})
 * @param req.query {object} - object of key/value pairs from URL query string (ex: ?str=wordio&tld=co)
 *    will override req.body. Values will be processed by decodeURIComponent
 * @param req.params {object} - object of key/value pairs from URL path  (ex: /v1/word/:key)
 *    will override req.query. Values will be processed by decodeURIComponent
 * @returns {{}} - combined keys/values. Original request object will NOT be modified.
 */
export default function aggregate_req_body_query_params(req: Record<string, any>): Record<string, any>;
