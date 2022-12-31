/**
 * Flatten this.phrase_lists into this.phrases
 * @requires this.phrase_lists {array} - dictionary of lists of phrases
 * @modifies this.phrases {array} - list of phrases
 */
let DEBUG0 = false;
let DEBUG1 = false;
let DEBUG2 = false;
export default function () {
    if (DEBUG1)
        global.cconsole.warn("this.phrases combine lists...");
    /*
     * Iterate each phrase, from each list, combine into one -
     * - more from first lists, less from later lists.
     * Make sure each added phrase is unique (add only once).
     */
    let phrase_lists_tuples = Object.entries(this.phrase_lists);
    let uqphrases = {};
    // loop over all lists i_while_max times
    // this is an arbitrary number, and should be refactored!
    // will loop over all lists, and in that, over all phrases, this many times!
    let i_while_max = 50;
    let i_while = 0;
    let exited_in_a_row = 0;
    while (i_while < i_while_max) {
        // loop over each list
        // n2add is number of phrases to slice from this list
        // {lists.length} from first list, {list.length -1} from second list, {1} from last list
        // use maximum 3 items, then one fewer for each list, minimum 1
        let n2add = 3; // use Object.keys(this.phrase_lists).length to prefer first, or "1" to not prefer any list
        /*
         * stop looping if all lists are empty - don't go to i_while_max
         */
        if (exited_in_a_row >= phrase_lists_tuples.length) {
            break;
        }
        else {
            exited_in_a_row = 0;
        }
        for (let tuple of phrase_lists_tuples) {
            let listname = tuple[0];
            let list = tuple[1];
            if (DEBUG2)
                global.cconsole.log(`listname:"${listname}", i_while:"${i_while}", n2add:"${n2add}"`);
            // Loop over each phrase:
            // {i_phrase} is in relation to entire list, even though...
            // ...this while loops over {n2add} number of phrases at a time.
            // Like "pagination" on a website, each {i_phrase} is index of a blog post;
            // the index of the page you are on is {i_phrase / n2add)
            let i_phrase_max = i_while * n2add + n2add;
            let i_phrase = i_while * n2add;
            // next list, use -= 1 items
            // lower immediately after done using, in case loop is exited prematurely
            if (n2add > 1) {
                n2add--;
            }
            if (!list[i_phrase]) {
                exited_in_a_row++;
                continue;
            }
            while (i_phrase < i_phrase_max) {
                // validate
                if (!list[i_phrase]) {
                    break;
                }
                // make phrase
                let phrase = list[i_phrase];
                let phrase_string = phrase.toString().toLowerCase();
                // empty phrase
                if (!phrase.length) {
                    i_phrase++;
                    continue;
                }
                /*
                 * unique
                 */
                // already exists ?
                if (uqphrases[phrase_string]) {
                    // delete current index
                    list.splice(i_phrase, 1);
                    // i_phrase+ // do not increment index, because list.length got shorter!
                    continue;
                }
                else {
                    // remember next time
                    uqphrases[phrase_string] = true;
                }
                /*
                 * skip if <=2 letters
                 */
                if (phrase_string.length <= 2) {
                    // skip this phrase
                    i_phrase++;
                    continue;
                }
                /*
                 * filter out phrases with awkward multiple plurals
                 */
                // count plural words
                let n_words = 0;
                let n_plurals = 0;
                for (let word of phrase) {
                    if (DEBUG1)
                        global.cconsole.log("add??", phrase, listname);
                    let winfo = this.chunks_dicts[word];
                    if (winfo) {
                        // count free morphemes (ignore function words)
                        if (!["nou", "ver", "adj", "adv"].includes(winfo[9])) {
                            n_words++;
                        }
                        // count plurals
                        if (winfo[4]) {
                            n_plurals++;
                        }
                    }
                }
                // only add if ONE plural word (or 2 out of 2)
                if (n_plurals >= 2 && n_words >= 3) {
                    i_phrase++;
                    continue;
                }
                // add phrase
                if (phrase_string) {
                    this.phrases.push(phrase);
                    if (DEBUG1)
                        global.cconsole.log("added", phrase, listname);
                }
                // next phrase
                i_phrase++;
            }
        }
        // next while
        i_while++;
    }
    if (DEBUG0)
        global.cconsole.log(this.phrases);
}
