/**
 * Used to sort a list of domain names by their domain extension - putting best ones higher in list.
 * @param domains {Array<String>} - list of domains - each string must contain at least one period "."
 * @param extensions {array} - list of extensions (domain extensions) to sort by. Best = first. Worst = last.
 * @param immutable {boolean} - Set this to `true` to make this a pure function, and immutable.
 *    By default, THIS IS NOT A PURE FUNCTION, it modifies the original array. Unless this is set to `true`.
 * @returns {array} - sorted array
 */
export default function sort_domains_by_extension(domains: Array<string>, extensions: Array<string>): Array<string>;
