/**
 * Adds row.str. Fixes row.acronym, row.proper, row.key
 * @param row {object} - DB row {key, dict, etc}
 *    REQUIRES: key, proper, ctr, acronym, str, abbreviation, singular, plural, root
 * @returns {object} - DB row {key, dict, pos_short, list, ok_list, sentiment, etc}
 */
export default function (row: any): any;
