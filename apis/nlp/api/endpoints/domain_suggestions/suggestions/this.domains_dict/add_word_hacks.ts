import tlds from "@ps/nlp/data/domains/all"
import is_vowel from "@techytools/fn/io/word/is_vowel"
let DEBUG1 = false
export default function () {
  /*
   *
   * ADD new strings to this.domains['word_hack']
   *
   */
  if (DEBUG1) global.cconsole.warn("this.tlds input for word hack = ", this.tlds)
  let tlds_set = new Set([this.tld])
  let tld_i = 0
  for (let tld of this.tlds_with_generic) {
    if (tlds_set.size > 10) {
      break
    }
    if (tld.length <= 3) {
      tlds_set.add(tld)
    }
    tld_i++
  }
  let tlds_arr = [...tlds_set]
  if (DEBUG1) global.cconsole.warn("use tlds for word hack = ", [...tlds_set])
  /*
   *
   * add TLD to each word hack
   *
   */
  // for each phrase
  let loop_i = 0
  for (let word of this.word_hacks) {
    /*
     * prepare variable
     */
    let dom: any = {
      words: [word],
      list: "word hack",
      rating: 10
    }
    dom.rating += is_vowel(word[word.length - 1]) ? 100 : 0
    dom.rating += 200 - word.length * 10

    /*
     * add one for each tld
     */
    for (let tld of tlds_arr) {
      // validate
      // end of word should not === tld
      if (word.substr(-tld.length) === tld) continue
      // edit dom
      dom = { ...dom }
      dom.tld = tld
      dom.string = word + " ." + tld
      // save dom
      if (!this.domains_dict[dom.string]) {
        this.domains_dict[dom.string] = dom
      }
    }

    /*
     * add dom hack
     * (last, after other tlds - because this changes the words)
     */
    // don't bother with really short ones - they're not available
    if (word.length >= 5) {
      // check 2-4 letter tlds
      for (let length of [2, 3, 4]) {
        if (word.length - length <= 2) continue
        let suffix = word.substr(-length)
        if (suffix === "to") {
          continue
        }
        if (is_vowel(suffix[suffix.length - 1]) || is_vowel(suffix[0])) {
          if (tlds[suffix]) {
            // edit dom
            dom = { ...dom }
            dom.tld = suffix
            dom.words[dom.words.length - 1] = word.substring(0, word.length - length)
            dom.string = dom.words.join(" ") + " ." + dom.tld
            // save dom
            if (!this.domains_dict[dom.string]) {
              this.domains_dict[dom.string] = dom
            }
          }
        }
      }
    }
    /*
     * remove one tld each few loops - leave only first best 2
     */
    if (tlds_arr.length > 2 && !(loop_i % 3)) {
      tlds_arr.pop()
    }
    // next hack
    loop_i++
  }
}
