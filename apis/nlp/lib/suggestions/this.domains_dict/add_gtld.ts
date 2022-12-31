import remove_tld_from_phrase from "./function/remove_tld_from_phrase"
import tlds from "@techytools/constants/data/domains/mixins/generic"

/**
 * Add a domain for each "replace one" original phrase,
 *    using each one of the "generic" tlds, to promote generic tlds.
 *      Note:
 *      from phrase_lists, instead of phrases
 *      items contain array of words, instead of phrase object
 * @requires this.phrases {array} - list of strings, withOUT extension
 * @modifies this.domains {array} - extrapolated list of strings, WITH tld extensions added
 */
let DEBUG1 = false
export default function () {
  if (this.phrase_lists["replace one"]) {
    let phrases = this.phrase_lists["replace one"]
    if (DEBUG1) global.cconsole.log('"replace one"', phrases)

    /*
     * each phrase
     */
    for (let phrase_words of phrases) {
      // each tld, inside each phrase
      for (let i = 0; i < tlds.length; i++) {
        /*
         * remove duplicate words (immutable copy of phrase)
         */
        let words = remove_tld_from_phrase.bind(this)(phrase_words, tlds[i])
        if (DEBUG1) global.cconsole.log(words)
        if (!words || !words.length) {
          continue
        }

        /*
         * make domain, by adding extension
         */
        let domain: any = {
          words: words,
          tld: tlds[i]
        }
        let str = domain.words.join(" ")
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
      }
    }
  }
}
