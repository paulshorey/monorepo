import decodeEntryToStrings from "./decodeEntryToStrings";
/**
 * Needs documentation
 */
export default function (entries: Array<string>) {
  let items: Array<string> = [];
  if (!entries || !entries.length) {
    return items;
  }
  for (let entry of entries) {
    let item = decodeEntryToStrings(entry);
    items.push(item);
  }
  return items;
}
