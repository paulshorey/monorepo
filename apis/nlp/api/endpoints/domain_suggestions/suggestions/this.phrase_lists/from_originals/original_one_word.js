import sort_strings_by_rating_and_position from "@ps/fn/io/sort_strings/sort_strings_by_rating_and_position";
// import { sort_strings_by_length } from "@ps/fn/io/sort_words"
// import * as sh from "@ps/fn/io/sh"
/**
 * Replace each word in a phrase, X times
 *        X = 2/3 of the number of 1st POS synonyms of that word
 *        `Math.floor(row.poss[row.pos1].length * 0.67)`
 * @returns {array} array - array of arrays (each child array value is a word)
 */
let DEBUG1 = false;
export default function () {
    let { chunks_keys, chunks_dict } = this;
    if (!this.phrase_lists["one word"]) {
        this.phrase_lists["one word"] = [];
    }
    let one_ratings = {};
    let one_words = [];
    for (let key of [...chunks_keys].reverse()) {
        let row = chunks_dict[key];
        if (row && row.poss) {
            /*
             * limit
             */
            let limit = 30;
            if (row.aux) {
                limit = 3;
            }
            /*
             * add derivations
             */
            {
                let word = row.plural;
                if (word) {
                    one_words.push(word);
                    if (!one_ratings[word]) {
                        one_ratings[word] = 20;
                    }
                }
            }
            {
                let word = row.singular;
                if (word) {
                    one_words.push(word);
                    if (!one_ratings[word]) {
                        one_ratings[word] = 20;
                    }
                }
            }
            /*
             * add synonym
             */
            let added = 0;
            for (let pos in row.poss) {
                if (pos === "bef" || pos === "aft")
                    continue;
                let list = row.poss[pos];
                for (let word of list) {
                    if (!word || word.length < 4)
                        continue;
                    added++;
                    if (added > limit) {
                        return;
                    }
                    one_words.push(word);
                    one_ratings[word] = 20 - Math.abs(7 - word.length);
                }
            }
        }
    }
    this.phrase_lists["one word"] = sort_strings_by_rating_and_position(one_words, one_ratings, 1).map((str) => [str]);
}
