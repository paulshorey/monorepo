/**
 * (promise) return info[1,0,0,...] tuple, to insert into row.dict
 *    USAGE: row.dict[key] = dict_info(row, '', true)
 * @param wrow {object} - DB row of this word
 *    key, str, proper, singular, plural, root, abbreviation, acronym, pos1, list_count, sentiment, sentiment
 * @param opos {string} - "old" pos
 *    sometimes value was bef/aft/ety
 *    most of the time it was nou/ver/adj/etc
 *    now, bef/aft/ety pos values moved to their own column
 * @param main {boolean} - if false, then considered a "derivative/root/helper" morpheme
 *    if true, will be noted as main content synonym of row
 *    if true, will be used as synonym (suggestions, thesaurus)
 *    if false, will be used only for NLP (root, plural, derivation)
 * @resolves info {object} - tuple
 *    [0] {boolean} - 1 is good or neutral, 0 is bad
 *    [1] {boolean} - 0 is ok, 1 is proper (capitalized)
 *    [2] {boolean} - 0 is ok, 1 if sentiment is unknown
 *    [3] {number} - str (includes punctuation and capitalization)
 *    [4] {string} - singular
 *    [5] {string} - plural
 *    [6] {string} - root
 *    [7] {string} - abbreviation
 *    [8] {string} - acronym
 *    [9] {string} - POS of word, 3-character abbreviation (nou, ver, adj) or 'modal'
 *    [10] {string} - pos changed! previous label here
 *    [11] {string} - 'bef' for before, 'aft' for after, or 'ety' for etymology
 *    [12] {boolean} - 1 if synonym - if 0, then it is a derivation or self, and should NOT be used as a synonym
 *    [13] {number} - list_count
 */
const DEBUG1 = process.env.DEBUG1;
export default function (wrow = {}, opos = "", main = false) {
    opos = opos.substring(0, 3);
    let bef_aft = opos && ["bef", "aft", "ety"].includes(opos);
    let info = [];
    info[0] = wrow.sentiment >= 0 ? 1 : 0; // update sentiment from DB
    info[1] = wrow.proper ? 1 : 0; // proper
    info[2] = wrow.sentiment === -1 || wrow.sentiment === 0 || wrow.sentiment === 1 ? 0 : 1; // if sentiment is unknown
    info[3] = wrow.str || wrow.key;
    // derivations
    info[4] = wrow.singular && wrow.singular !== wrow.key ? wrow.singular : null;
    info[5] = wrow.plural && wrow.plural !== wrow.key ? wrow.plural : null;
    info[6] = wrow.root && wrow.root !== wrow.key ? wrow.root : null;
    info[7] = wrow.abbreviation && wrow.abbreviation !== wrow.key ? wrow.abbreviation : null;
    info[8] = wrow.acronym && wrow.acronym !== wrow.key ? wrow.acronym : null;
    // pos
    info[9] = wrow.pos1 ? wrow.pos1 : "etc"; // new, corrected POS
    info[10] = opos && !bef_aft && opos !== wrow.pos1 ? opos : null; // POS changed! previous value here
    info[11] = opos && bef_aft ? opos : null; // word is Before/After/Etymology
    info[12] = main ? 1 : 0; // true = main synonym; false = not synym, but some kind of root/derivation
    info[13] = wrow.list_count || 0;
    return info;
}
