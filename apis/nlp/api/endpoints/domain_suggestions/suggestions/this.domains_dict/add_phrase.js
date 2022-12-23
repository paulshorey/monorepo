// import { sort_strings_by_width } from "@techytools/fn/io/sort_words"
// import { sort_strings_by_length_and_position, sort_strings_by_matches_in_list } from "@techytools/fn/io/sort_strings/index"
// import remove_tld_from_phrase from "./function/remove_tld_from_phrase"
// import list_domains_phrases_ending_in_tld from "./list_domains_phrases_ending_in_tld"
// import * as sh from "@techytools/fn/io/sh"
// import generic_tlds from "@ps/nlp/data/domains/mixins/generic"
/**
 * Lists
 * @requires this.phrases {array} - list of strings, withOUT extension
 * @modifies this.domains {array} - extrapolated list of strings, WITH tld extensions added
 */
let DEBUG1 = false
let DEBUG2 = false
export default function () {
  /*
   * add TLDs to Suggestions Phrases
   */
  let phrase_i = 0
  // how many tlds to use? start with all, then for few couple phrases, remove a tld
  // if remove one every 3 phrases, and started with 12, then will use 36 phrases total
  let tlds_cut = this.tlds_with_generic
  // each phrase
  for (let words of this.phrases) {
    if (DEBUG1) global.cconsole.log("words", words)
    if (!words) continue
    // each tld, inside each phrase
    for (let i = 0; i < tlds_cut.length; i++) {
      // if (DEBUG1) global.cconsole.log("words.tld", words, tlds_cut[i])
      /*
       * remove duplicate words (immutable copy of phrase)
       */
      // words = remove_tld_from_phrase.bind(this)(words, tlds_cut[i], this.chunks_dict)
      if (!words || !words.length) continue
      /*
       * make domain, by adding extension
       */
      let domain = {
        words: words,
        tld: tlds_cut[i]
      }
      let str = domain.words.join(" ")
      // if (DEBUG1) global.cconsole.log("str", str)
      /*
       * ignore 3-letter words - will probably not be available
       * ok if otherwise very few suggestions
       */
      if (this.phrases.length >= 5) {
        if (str.length <= 3) continue
      }
      domain.string = str + " ." + domain.tld
      domain.list = "name"
      /*
       * save domain domain string with tld
       */
      if (!this.domains_dict[domain.string]) {
        this.domains_dict[domain.string] = domain
      }
      /*
       * next phrase - use fewer domains
       */
      phrase_i++
      // use less tlds after every X entries
      if (tlds_cut.length > 1) {
        if (phrase_i % 10 === 0) {
          tlds_cut.pop()
        }
      }
    }
  }
}
