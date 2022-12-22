import arrays_mix from "@ps/fn/io/arrays/arrays_mix";
// import { sort_strings_by_length } from "@ps/fn/io/sort_words"
/**
 * Replace each word in a phrase, X timesover.
 *        X = 2/3 of the number of 1st POS synonyms of that word
 *        `Math.floor(row.poss[row.pos1].length * 0.67)`
 * @returns {array} array - array of arrays (each child array value is a word)
 */
let DEBUG0 = false;
let DEBUG1 = false;
export default function () {
    let { keys_words, chunks_dict, chunks_dicts } = this;
    let use_keys = [...keys_words];
    if (!this.phrase_lists["replace one"]) {
        this.phrase_lists["replace one"] = [];
    }
    let lists_of_phrases = [];
    /*
     *
     * For each word in phrase, maybe replace it with a synonym...
     *
     */
    for (let chunk_i = 0; chunk_i < use_keys.length; chunk_i++) {
        let prev_key = use_keys[chunk_i - 1];
        let is_last = chunk_i === use_keys.length - 1;
        let phrases = [];
        /*
         * Chunk row
         */
        let key = use_keys[chunk_i];
        // get data
        let row = chunks_dict[key];
        if (row.aux || row.stop)
            continue;
        if (DEBUG1)
            global.cconsole.info(row.key, row.pos1, !!row.poss[row.pos1]);
        // // not allowed duplicate pos word
        // // unless it's noun or verb or adj
        // let previous_pos = ""
        // if (row.pos1 !== previous_pos && row.pos1 !== "nou" && row.pos1 !== "ver" && row.pos1 !== "adj") {
        //   continue
        // }
        // previous_pos = row.pos1
        //
        // if (!row || !row.poss) {
        //   use_keys.splice(chunk_i, 1)
        //   continue
        // }
        // which words to replace with ?
        let syns_dict = {};
        // use derivations
        if (row.root)
            syns_dict[row.root.toLowerCase()] = row.root;
        if (row.singular)
            syns_dict[row.singular.toLowerCase()] = row.singular;
        if (row.abbreviation) {
            let abbrs = row.abbreviation.split(",");
            for (let abbr of abbrs) {
                if (!abbr)
                    continue;
                syns_dict[abbr.toLowerCase()] = abbr;
            }
        }
        if (row.acronym)
            syns_dict[row.acronym.toLowerCase()] = row.acronym.toLowerCase();
        // only allow plural for last word in phrase
        if (chunk_i === use_keys.length - 1) {
            if (row.plural)
                syns_dict[row.plural.toLowerCase()] = row.plural;
        }
        // use synonyms
        if (row.poss[row.pos1]) {
            let pos = row.pos1;
            if (is_last && pos === "adj" && row.pos2 === "adv") {
                pos = "adv";
            }
            if (DEBUG1)
                global.cconsole.log("use synonyms", row.poss[pos]);
            for (let word of row.poss[pos]) {
                if (!word)
                    continue;
                // only use plural synonym for last chunk in phrase
                let word_info = this.chunks_dicts[word];
                if (word_info && word_info[4]) {
                    if (chunk_i !== use_keys.length - 1) {
                        continue;
                    }
                }
                // use synonym
                if (!syns_dict[word]) {
                    syns_dict[word.toLowerCase()] = word;
                }
            }
        }
        let syns_list = Object.values(syns_dict);
        /*
         *
         * For each synonym of each word...
         *
         */
        let limit = Math.min(12, Math.floor(syns_list.length * 0.75));
        for (let syn_i = 0; syn_i <= 30; syn_i++) {
            let syn = syns_list[syn_i];
            if (!syn)
                continue;
            syn = syn.toLowerCase();
            /*
             * Add phrase with replaced word
             */
            let words = [...use_keys];
            // make sure we don't add a duplicate word (same word as prev/next word)
            let prev = words[chunk_i - 1];
            let next = words[chunk_i + 1];
            // if === last word
            if ((prev && prev === syn) || (next && next === syn)) {
                syn = "";
            }
            // prevent duplicate
            if (next && syn.substr(-next.length) === next) {
                continue;
            }
            if (prev && prev.substr(-syn.length) === syn) {
                continue;
            }
            // pluralize previous pronoun/preposition
            if (row.singular && prev) {
                // if row is plural (has singular)...
                let prev_row = chunks_dict[prev];
                if (prev_row.pos1 === "pro" || prev_row.pos1 === "pre") {
                    // if prev row is pronoun/preposition...
                    let prev_plural = prev_row.singular ? prev_row.key : prev_row.plural || "";
                    let prev_singular = prev_row.plural ? prev_row.key : prev_row.singular || "";
                    let syn_info = chunks_dicts[syn || use_keys[chunk_i]];
                    if (!syn_info)
                        continue;
                    let syn_plural = syn_info[5] || syn;
                    let syn_singular = syn_info[4] || syn;
                    // combine special...
                    // singular->singular
                    if (prev_singular && syn_singular) {
                        // if (syn_i < limit) {
                        phrases.push(prev_singular + " " + syn_singular);
                        // } else {
                        //   this.com_hacks.push([prev_singular, syn_singular])
                        // }
                    }
                    // plural->plural
                    if (prev_plural && syn_plural) {
                        if (syn_i < limit) {
                            phrases.push(prev_plural + " " + syn_plural);
                        }
                        else {
                            // this.com_hacks.push([prev_plural, syn_plural])
                        }
                    }
                    // don't do normal logic
                    continue;
                }
            }
            // if ok to add
            if (syn) {
                words.splice(chunk_i, 1, syn);
            }
            // limit
            if (syn_i <= limit) {
                phrases.push(words.join(" "));
            }
            else {
                phrases.push(words.join(" "));
                // this.com_hacks.push(words)
            }
        }
        // replaced word with synyms
        lists_of_phrases.push(phrases);
    }
    /*
     *
     * SORT phrase lists ["replace one"]
     *
     */
    if (DEBUG0)
        global.cconsole.log("lists_of_phrases", lists_of_phrases);
    this.phrase_lists["replace one"] = arrays_mix(lists_of_phrases);
    this.phrase_lists["replace one"] = this.phrase_lists["replace one"].map(function (str) {
        return str.split(" ");
    });
    let new_list = [];
    if (keys_words.length >= 3) {
        for (let words of this.phrase_lists["replace one"]) {
            if (words.length >= 3) {
                new_list.push(words.slice(1));
                new_list.push(words.slice(0, words.length - 1));
                new_list.push(words);
            }
        }
        this.phrase_lists["replace one"] = new_list;
    }
    if (DEBUG0)
        global.cconsole.log(this.phrase_lists["replace one"]);
}
