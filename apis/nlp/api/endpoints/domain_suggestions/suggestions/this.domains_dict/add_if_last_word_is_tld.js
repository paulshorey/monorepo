import tlds from "@ps/nlp/data/domains/all";
export default function () {
    /*
     *
     * if last word matches tld, add to regular phrases
     *
     */
    for (let words of this.phrases) {
        /*
         * separate last word from phrase
         */
        let last_index = words.length - 1;
        let last_word = words[last_index];
        let first_words = words.slice(0, last_index);
        if (!first_words || !first_words[0])
            continue;
        /*
         * check if last word = tld
         */
        if (tlds[last_word]) {
            // construct domain
            let domain = {
                words: first_words,
                tld: last_word
            };
            let str = first_words.join(" ");
            if (str.length <= 2)
                continue;
            domain.string = str + " ." + last_word;
            domain.list = "name";
            // save domain
            if (!this.domains_dict[domain.string]) {
                this.domains_dict[domain.string] = domain;
            }
        }
    }
}
