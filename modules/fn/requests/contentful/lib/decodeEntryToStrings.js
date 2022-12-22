import decodeEntriesToStrings from "./decodeEntriesToStrings";
import partnerFields from "./partnerFields";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";

/**
 * Needs documentation
 */
export default function decodeEntryToStrings(int: {
  sys: { id: string };
  contentType?: { id: string };
  fields: { [key: string]: any };
}) {
  let out = {
    id: int.sys?.id
  };
  for (let fieldKey in int.fields) {
    let fieldValue = int.fields[fieldKey];
    if (typeof fieldValue !== "object") {
      // simple string/number/boolean, no problem!
      out[fieldKey] = fieldValue;
    } else {
      // if empty list
      if (fieldValue.length === 0) {
        out[fieldKey] = [];
      }
      // if one linked entry, then response already contains the linked entry's content. Just decode it.
      if (fieldValue.sys && fieldValue.fields) {
        out[fieldKey] = decodeEntryToStrings(fieldValue);
        continue;
      }
      // if multiple linked entries, then response does not contain the linked entry's content. Must fetch it.
      if (fieldValue.length > 0 && fieldValue[0].sys && fieldValue[0].fields) {
        out[fieldKey] = decodeEntriesToStrings(fieldValue);
        continue;
      }
      // default, so React JSX wont have to worry about undefined/null cases
      out[fieldKey] = "";
      // complex object, either image or rich text or maybe something else?
      if (typeof fieldValue[0] === "object" && fieldValue[0].original_url) {
        // image
        out[fieldKey] = fieldValue[0].original_url;
      } else if (fieldValue?.content && fieldValue.content[0]) {
        // Contentful's proprietary RTF JSON (Rich Text field)
        out[fieldKey] = documentToHtmlString(fieldValue);
      }
    }
  }
  if (int?.sys?.contentType?.sys?.id === "partner") {
    out = partnerFields(out);
  }
  // console.log(int?.sys?.contentType, out);
  return out;
}
