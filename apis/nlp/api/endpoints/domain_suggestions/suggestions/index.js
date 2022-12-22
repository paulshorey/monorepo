// import { responseDataType } from "../types"
// import {objects_merge} from "@ps/fn/io/objects";
import nlp from "./nlp";
import phrase_lists from "./this.phrase_lists";
import tlds from "./this.tlds";
import domains_dict from "./this.domains_dict";
import domains_mix from "./this.domains_mix";
import domains_lists from "./this.domains_lists";
import phrases from "./this.phrases";
import word_hacks from "./this.word_hacks";
import phrase_hacks from "./this.phrase_hacks";
import syllable_count from "@ps/fn/io/word/syllable_count";
const rate_word = function (key, dict) {
    if (key && dict[key] && !this.chunks_dicts[key]) {
        this.chunks_dicts[key] = dict[key];
        this.chunks_dicts[key][15] = syllable_count(key);
        let rating = 20;
        let pos = this.chunks_dicts[key][11] || this.chunks_dicts[key][9];
        if (pos === "adj") {
            rating = 50;
        }
        else if (pos === "nou") {
            rating = 40;
        }
        else if (pos === "ver" || pos === "adv") {
            rating = 30;
        }
        rating = Math.max(Math.round(rating / (this.chunks_dicts[key][15] || 3)), 2); // treat syllables 1 and 2 the same
        this.word_ratings[key] = rating;
    }
};
/**
 * Suggestions
 * @param {object} options - object of optional options { length_vs_relevance: 2.5, tlds_limit: 10, ...etc }
 * @param {array} tlds_user - favorited by user
 * @param {array} tlds_unchecked - previously checked, but unchecked by user
 * @returns {object} - see variable `results`
 */
let DEBUG0 = false;
let DEBUG1 = false;
export default async function (string_original, string, tld, chunks_keys, // will be flattened into chunks_keys
chunks_rows, options = {}, tlds_user = [], tlds_unchecked = [], bing_alts = []) {
    /*
     *
     * OUTPUT is referred to as
     * "this" (in other modules, ex: this.phrases.js), because other modules are all bound functions
     * "results" (in this module), because I don't want to add lots of code just to keep a variable name consistent
     *
     */
    let results = {
        /*
         * output - will be permanent response to user API
         */
        string_original: string_original,
        string: string,
        tld: tld,
        tlds: [],
        tlds_extra: [],
        domains_lists: { mix: [], com: [], name: [], tld: [] },
        // ^- each key is the name of the collection, each value is an array of domain name strings (phrase + ' .' + tld)
        /*
         * output for development on FE
         */
        phrase_lists: {
            original: [] // work in progress dictionary of lists
        },
        phrases: [],
        word_hacks: [],
        phrase_hacks: [],
        syl_count: syllable_count(string_original),
        is_name: false,
        is_brand: false,
        is_tech: false,
        is_food: false,
        /*
         * temporary properties - (modified) input from user, not output
         */
        best_keys: [],
        domains_dict: {},
        chunks_dicts: {},
        options: options,
        tlds_user: tlds_user,
        tlds_unchecked: tlds_unchecked,
        tld_chunk: chunks_rows[tld] || {},
        chunks_keys: [],
        chunks_dict: chunks_rows,
        keys_words: chunks_keys[chunks_keys.length - 1] || [],
        string_nospaces: string.replace(/[^\w\d]+/g, ""),
        string_original_nospaces: string_original.replace(/[^\w\d]+/g, ""),
        bing_alts: bing_alts
    };
    if (results.string_nospaces === results.string_original_nospaces) {
        results.string_original = results.string;
    }
    // chunks_keys = flattened chunks_keys,
    // but remove old keys before adding, so add new keys to the end
    for (let group of chunks_keys) {
        for (let word of group) {
            let iword = results.chunks_keys.indexOf(word);
            if (iword !== -1) {
                results.chunks_keys.splice(iword, 1);
            }
            results.chunks_keys.push(word);
        }
    }
    // add domain as if it was a word
    if (results.keys_words.length === 1 && results.tld.length >= 4 && results.tld_chunk.list_count > 25) {
        results.keys_words.push(results.tld);
    }
    // special case, relies on keys_words - use TLD as last word
    results.keys_words_and_tld = [...results.keys_words, results.tld];
    results.chunks_keys_and_tld = [...results.chunks_keys, results.tld];
    // fix tlds
    if (!tlds_user.includes(tld) && !tlds_unchecked.includes(tld)) {
        tlds_user.unshift(tld);
    }
    if (DEBUG1)
        global.cconsole.success("keys_words", results.keys_words);
    if (DEBUG1)
        global.cconsole.success("chunks_dict", Object.keys(results.chunks_dict));
    /*
     * aggregate chunks_dicts from each row.dict
     * also, give it a rating, as the i13 item in dict_info
     */
    results.word_ratings = {};
    results.chunks_dicts = {};
    for (let key in results.chunks_dict) {
        let row = results.chunks_dict[key];
        // is_name?
        if (row.name) {
            results.is_name = row.key;
        }
        // is_food?
        if (row.food) {
            results.is_food = row.key;
        }
        // is_tech?
        if (row.tech) {
            results.is_tech = row.key;
        }
        // synonyms
        for (let pos in row.poss) {
            let list = row.poss[pos];
            let rating = 100;
            for (let word of list) {
                rating -= 5;
                rate_word.bind(results)(word, row.dict);
            }
        }
        // derivations
        rate_word.bind(results)(row.key, row.dict);
        rate_word.bind(results)(row.singular, row.dict);
        rate_word.bind(results)(row.plural, row.dict);
        rate_word.bind(results)(row.root, row.dict);
        rate_word.bind(results)(row.acronym, row.dict);
        if (row.abbreviation) {
            for (let word of row.abbreviation.split(",")) {
                rate_word.bind(results)(word.trim(), row.dict);
            }
        }
    }
    /*
     * is plural ?
     */
    results.key_first = results.keys_words[0];
    results.key_last = results.keys_words.length > 1 ? results.keys_words[results.keys_words.length - 1] : "";
    if (results.key_last) {
        results.key_last_plural = !!results.chunks_dict[results.key_last].singular;
    }
    /*
     * is_name? is_brand? is_(iterrogat)ive?
     */
    let is_about = false;
    // is brand name if could not get meaning for one of the words
    let length_diff = results.string_original_nospaces.length - results.string_nospaces.length;
    if (length_diff >= 4) {
        results.is_brand = true;
        if (DEBUG1)
            global.cconsole.error(`is_brand because length_diff >=4 (${length_diff})`);
        if (DEBUG1)
            global.cconsole.error(`results.string_original_nospaces="${results.string_original_nospaces}"`);
        if (DEBUG1)
            global.cconsole.error(`results.string_nospaces="${results.string_nospaces}"`);
    }
    // (or for all the words)
    if (results.keys_words.length === 1) {
        let row = results.chunks_dict[results.keys_words[0]];
        // detect results parsed row is not a real row from DB
        if (!row || !row.list_count || (!row.name && row.pos1 === "etc" && row.list_count < 10 && row.key.length >= 3)) {
            // not enough points, maybe brand name ? gibberish ?
            results.is_brand = results.string_original_nospaces;
            if (DEBUG1)
                global.cconsole.error(`is_brand because !row for key="${results.keys_words[0]}"`);
        }
        else if (row.brand) {
            // brand
            results.is_brand = row.key;
            if (DEBUG1)
                global.cconsole.error(`is_brand because row.brand key="${row.key}"`);
        }
        else {
            // phrase is interrogative
            if (row.pos1 === "ive" ||
                (row.pos1 === "adv" && row.aux) ||
                ((row.pos1 === "ver" || (row.pos1 === "etc" && row.pos2 === "ver")) && row.aux)) {
                is_about = true;
            }
            // word follows interrogative, and is noun/verb
            if (is_about) {
                if (row.pos1 === "nou" && !row.aux) {
                    results.is_about_nou = row.key;
                }
                else if (row.pos1 === "ver" && !row.mod && !row.aux && row.key.length >= 4) {
                    results.is_about_ver = row.key;
                }
            }
        }
        // not about anything
        if (!results.is_name && !is_about && row.list_count < 10) {
            results.is_brand = string;
            if (DEBUG1)
                global.cconsole.error(`is_brand because one low list_count word "${results.is_brand}"`);
        }
    }
    if (DEBUG0 && results.is_name)
        global.cconsole.error("results.is_name", results.is_name);
    if (DEBUG0 && results.is_brand)
        global.cconsole.error("results.is_brand", results.is_brand);
    if (DEBUG0 && is_about)
        global.cconsole.error("is_about: nou, ver", results.is_about_nou, results.is_about_ver);
    /*
     *
     * Best 123
     *
     */
    let bphrases = [];
    let bnouns = [];
    let bverbs = [];
    let badjvs = [];
    for (let key of results.chunks_keys_and_tld) {
        let row = results.chunks_dict[key];
        if (row && row.list_count) {
            // if greater than 10 = if not stopword or nonsense
            if (row.list_count > 10 || (row.tlds && row.tlds[0].length)) {
                if (row.pos1 === "nou" || row.pos1 === "int") {
                    if (key.split(" ").length >= 2) {
                        // noun phrase
                        bphrases.push(key);
                    }
                    else {
                        // regular noun
                        bnouns.push(key);
                    }
                }
                else if (row.pos1 === "ver") {
                    bverbs.push(key);
                }
                else if (row.pos1 === "adj" || row.pos1 === "adv") {
                    badjvs.push(key);
                }
            }
        }
    }
    let best1 = bphrases.pop() || bnouns.pop() || bverbs.pop() || badjvs.pop();
    let best2 = bphrases.pop() || bnouns.pop() || bverbs.pop() || badjvs.pop();
    let best3 = bphrases.pop() || bnouns.pop() || bverbs.pop() || badjvs.pop();
    if (!best1) {
        let bestA = ["", 0];
        let bestB = ["", 0];
        for (let key of results.keys_words) {
            if (key.length < 3)
                continue;
            let row = results.chunks_dict[key];
            if (key.length === 3 && row.list_count < 25)
                continue;
            if (row.list_count > bestA[1]) {
                bestA = [row.key, row.list_count];
            }
            else if (row.list_count > bestB[1]) {
                bestB = [row.key, row.list_count];
            }
        }
        best1 = bestA[0];
        best2 = bestB[0];
    }
    if (best1)
        results.best_keys.push(best1);
    if (best2)
        results.best_keys.push(best2);
    if (best3)
        results.best_keys.push(best3);
    /*
     *
     * DEFAULT OPTIONS
     *
     */
    if (!options.length_vs_relevance)
        options.length_vs_relevance = 5;
    if (!options.ext_suggestions_num)
        options.ext_suggestions_num = 30;
    /*
     *
     * SYNONYM BASED
     *
     */
    /*
     * nlp
     */
    nlp.call(results);
    /*
     * tlds
     */
    await tlds.call(results);
    /*
     * phrase lists
     */
    phrase_lists.call(results);
    /*
     * combine ${phrase_lists} into flat ${phrases}
     */
    phrases.call(results);
    /*
     *
     * HACKS
     *
     */
    if (options.use_word_hacks !== false) {
        word_hacks.call(results);
    }
    if (options.use_phrase_hacks !== false) {
        phrase_hacks.call(results);
    }
    /*
     *
     * DOMAINS
     *
     */
    domains_dict.call(results);
    domains_lists.call(results);
    domains_mix.call(results);
    /*
     *
     * Output
     *
     */
    delete results.domains_dict;
    return results;
}
