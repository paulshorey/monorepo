/**
 * Sort strings by relevance (matching words in list)
 * Strings will be promoted if they match most words in list, and have fewest remaining characters.
 * @param arr - list of strings
 *      (this function modifies the original array, using .sort())
 * @param matchList - list of words - first in list is most important
 * @returns - sorted array or strings
 */
export default function sort_strings_by_matches_in_list(arr: Array<string>, matchList: Array<string>): string[];
