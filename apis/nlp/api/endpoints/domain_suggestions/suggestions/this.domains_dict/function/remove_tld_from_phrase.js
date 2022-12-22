/**
 * Construct an new array of words, to use for domain object, from input array
 * @param phrase_words {array} - list of words
 * @param tld {string}
 * @returns {array||undefined}
 */
export default function (phrase_words, tld) {
    if (!phrase_words || !tld) {
        return;
    }
    let words = [];
    let tld_info = this.chunks_dicts[tld] || [];
    /*
     * construct new words array
     */
    let word_i_last = phrase_words.length - 1;
    let word_i = 0;
    for (let word of phrase_words) {
        // compare word to tld
        // compare word chunks_dicts to tld
        // compare tld chunks_dicts to word
        if (word === tld || (this.chunks_dicts[word] && this.chunks_dicts[word].includes(tld)) || tld_info.includes(word)) {
            // if last or middle word, replace with tld;
            // if first word, then just quit
            if (word_i === word_i_last) {
                continue;
            }
            else {
                return;
            }
        }
        // if tld is ending of last word,
        // then remove the 'tld' part of the word, and continue
        if (word_i === word_i_last) {
            if (word.substr(-tld.length) === tld) {
                word = word.substring(0, word.length - tld.length);
            }
        }
        // passed the test! add word
        if (word) {
            words.push(word);
        }
        // next
        word_i++;
    }
    /*
     * if the new last word is a determiner/conjunction/etc, remove it
     */
    if (words.length && words.length !== phrase_words.length) {
        let last_index = words.length - 1;
        let last_word = words[last_index];
        let row = this.chunks_dict[last_word];
        if (row && row.list_count && (row.pos1 === "det" || row.pos1 === "con" || row.pos1 === "pre")) {
            words.splice(last_index, 1);
        }
    }
    return words[0] ? words : [];
}
