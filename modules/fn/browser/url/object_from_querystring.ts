/**
 * Parse the URL querystring to JavaScript Object
 * ex: `?one=1&two=something` => {one:1,two:'something'}
 * @param str - starting with `?`
 * @returns - JS Object of key-value query params
 */
export default function (str: string = ""): Record<string, string | number> {
  // make object
  let obj = {};
  let pairs = str.replace("?", "").split("&");
  for (let pair of pairs) {
    if (!pair) continue;
    let tuple = pair.split("=");
    let key = tuple[0];
    if (!key) continue;
    obj[key] = tuple[1] || "";
  }
  // decode value
  for (let key in obj) {
    obj[key] = decodeURIComponent(obj[key] || "").trim();
  }
  // done
  return obj;
}
