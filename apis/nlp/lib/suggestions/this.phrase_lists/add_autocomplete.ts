import stopwords from "@techytools/constants/data/words/stopwords"
/**
 * Replace each word in a phrase, X times
 *        X = 2/3 of the number of 1st POS synonyms of that word
 *        `Math.floor(row.poss[row.pos1].length * 0.67)`
 * @returns {array} array - array of arrays (each child array value is a word)
 */
let DEBUG1 = false
export default function () {
  let { keys_words, bing_alts } = this
  let to_add = []

  /*
   * mix-in bing suggestions
   */
  let added_alt: any = {}
  if (bing_alts.length) {
    if (DEBUG1) global.cconsole.log("use_autocomplete keys_words:", keys_words)
    if (DEBUG1) global.cconsole.log("use_autocomplete bing_alts:", bing_alts)
    for (let alt_str of bing_alts) {
      if (alt_str.length > 30) continue
      if (DEBUG1) global.cconsole.log([alt_str])

      let last_word_i = alt_str.lastIndexOf(" ")
      if (last_word_i === -1) continue
      let last_word = alt_str.substr(last_word_i + 1).trim()
      if (DEBUG1) global.cconsole.log(last_word)
      if (last_word && stopwords[last_word]) continue

      to_add.push(alt_str.split(" "))
      added_alt[alt_str] = true
    }
  }

  if (to_add.length) {
    this.phrase_lists["autocomplete"] = to_add
  }
}
