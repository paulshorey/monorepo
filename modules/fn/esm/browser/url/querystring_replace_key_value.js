function str_trim_char(s, c) {
    if (c === "]")
        c = "\\]";
    if (c === "\\")
        c = "\\\\";
    return s.replace(new RegExp("^[" + c + "]+|[" + c + "]+$", "g"), "");
}
/**
 * Change a url (GET) parameter in queryString string
 * @param queryString - ex: `?start=10&fruit=apple`
 * @param key - ex: `fruit`
 * @param value - ex: `species`
 * @return - ex: `?start=10&species=apple`
 */
export default function (queryString, key, value) {
    // clean input
    queryString = str_trim_char(queryString, "&");
    queryString = str_trim_char(queryString, "?");
    let obj = JSON.parse('{"' + decodeURI(queryString).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
    // replace value
    obj[key] = value;
    // rebuild queryString with replaced value
    let output = "?";
    for (let pair of Object.entries(obj)) {
        output += pair[0] + "=";
        output += pair[1] + "&";
    }
    return str_trim_char(output, "&");
}
