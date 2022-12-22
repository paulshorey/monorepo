import json_parse from "../json/json_parse";
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
export default function aggregate_req_body_query_params(req) {
    /*
     * 1. prepare output
     */
    let output = {};
    // req.body is least important, will be overridden by query/params
    if (req.body) {
        output = req.body;
    }
    /*
     * 2. aggregate inputs
     */
    // req.query is more important than req.body
    let inputs = {};
    if (req.query) {
        inputs = req.query;
    }
    // req.params is the most important
    if (req.params) {
        for (let key in req.params) {
            let val = req.params[key];
            if (val && val !== 0) {
                inputs[key] = val;
            }
        }
    }
    /*
     * 3. process inputs
     */
    if (inputs) {
        for (let key in inputs) {
            let val = inputs[key];
            val = decodeURIComponent(val);
            val = json_parse(val); // convert "null" to null, same with other encoded variable types like undefined, false, 0
            output[key] = val;
        }
    }
    // combined
    return output;
}
