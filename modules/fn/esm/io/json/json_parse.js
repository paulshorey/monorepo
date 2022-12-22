/**
 * Parse JSON variable - recursively
 * @param value - Any variable type
 * @returns - Intelligently parsed value. Will convert "4" to number type, "false" to boolean, etc.
 * NOTE: JSON can not stringify ES6 types Set and Map. Stringify/parse, changes value to empty object.
 * As a workaround, before stringifying, convert Set to Array, and Map to Array of tuples.
 */
export default function json_parse(value) {
    if (typeof value === "string") {
        value = value.trim();
    }
    let variable;
    // Simple parse variable
    if (typeof value === "string" && (value[0] === "[" || value[0] === "{" || value[0] === '"')) {
        try {
            variable = JSON.parse(value); // JSON stringified array or object
        }
        catch (e) {
            try {
                variable = JSON.parse(value.replace(/[\r\n]+/g, "").replace(/[\t]+/g, " ")); // edge case
            }
            catch (e) {
                variable = value.includes("[") ? [] : {}; // broken JSON array or object
            }
        }
    }
    else if (value === "true") {
        variable = true;
    }
    else if (value === "false") {
        variable = false;
    }
    else if (value === "null") {
        variable = null; // same logic as in JSON.parse()
    }
    else if (value === "undefined") {
        variable = undefined; // same logic as in JSON.parse()
    }
    else {
        // simple value (JSON.parse converts numbers in quotes to type number)
        try {
            variable = JSON.parse(value); // number
        }
        catch (e) {
            variable = value; // string or undefined
        }
    }
    // Parse recursively - if Object/Array
    if (typeof variable === "object") {
        // iterate all props/values
        for (let key in variable) {
            if (!variable.hasOwnProperty(key))
                continue;
            // parse each prop/value
            variable[key] = json_parse(variable[key]);
        }
    }
    return variable;
}
