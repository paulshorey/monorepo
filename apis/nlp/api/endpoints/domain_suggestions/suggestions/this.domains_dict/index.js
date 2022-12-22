import add_phrases from "./add_phrase";
// import add_if_last_word_is_tld from "./add_if_last_word_is_tld"
import return_phrases_end_in_tld from "./function/return_phrases_end_in_tld";
// import add_com_hacks from "./add_com_hacks"
import add_originals_tlds from "./add_originals_tlds";
import add_word_hacks from "./add_word_hacks";
import add_phrase_hacks from "./add_phrase_hacks";
// import add_gtld from "./add_gtld"
/**
 * Sort list of domains
 */
let DEBUG1 = false;
export default function () {
    /*
     * from ORIGINAL PHRASE
     */
    add_originals_tlds.call(this);
    /*
     * from DOMAIN HACKS (ending tld)
     * NOTE: this must be done BEFORE "_from_phrases",
     * because part of "_from_phrases" is a check to remove duplicate word/tld combo,
     * but the word-hack "_ends_in_tld" relies on such duplicate strings
     */
    // add_if_last_word_is_tld.call(this)
    /*
     * insert GENERIC TLDS
     */
    // add_gtld.call(this)
    /*
     * from PHRASES
     */
    add_phrases.call(this);
    /*
     * LIST of "domain hacks" -
     * - where the last part of a word (not the whole word) ends in tld
     * To be mixed-into the _from_phrases list.
     */
    let domain_hacks = return_phrases_end_in_tld.call(this);
    /*
     * MIX IN DOMAIN HACKS
     */
    // global.cconsole.info('domains from phrases',domain_phrases.map(obj=>obj.string));
    let domain_phrases = Object.values(this.domains_dict);
    for (let domi = 0; domi < Math.max(domain_phrases.length, domain_hacks.length); domi++) {
        // every time, add one from "domain_phrases"
        let dom = domain_phrases[domi];
        if (dom) {
            if (!this.domains_dict[dom.string]) {
                this.domains_dict[dom.string] = dom;
            }
        }
        // every Nth time, starting with 0, add one from "domain_hacks"
        let N = 3;
        if (!(domi % N)) {
            let dom = domain_hacks[domi / N];
            if (dom) {
                if (!this.domains_dict[dom.string]) {
                    this.domains_dict[dom.string] = dom;
                }
            }
        }
    }
    /*
     * COM (leftover synonyms not relevant enough to be used for nTLDs extensions)
     */
    // add_com_hacks.call(this)
    /*
     * WORD HACKS (modified word)
     */
    add_word_hacks.call(this);
    /*
     * WORD HACKS (prepend/append random word)
     */
    add_phrase_hacks.call(this);
    // debug
    if (DEBUG1) {
        for (let domstr in this.domains_dict) {
            console.log(domstr);
        }
    }
}
