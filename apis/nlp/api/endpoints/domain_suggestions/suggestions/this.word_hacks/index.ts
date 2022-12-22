import add_from_words from "./add_from_words"
// import { sort_strings_by_length_asc } from "@ps/fn/io/sort_strings"
export default function (this: any) {
  // only enable if single word, with generic tld
  // if (this.keys_words.length > 1 || this.tld_chunk.list_count>50) {
  //   return;
  // }
  /*
   *
   *
   * FROM WORDS
   *
   *
   */
  let enable_wordhacks = true

  // start with original words
  let words_to_use = []
  for (let key of [...this.best_keys, ...this.chunks_keys]) {
    let row = this.chunks_dict[key]
    if (this.good_tlds > 10 && row.sentiment === -1) {
      enable_wordhacks = false
      // break
    }
    if (row && row.list_count >= 20) {
      words_to_use.push(row.key)
      // if (row.root) words_to_use.push(row.root)
      if (row.singular) words_to_use.push(row.singular)
    }
  }
  // if (enable_wordhacks) {
  // add from synonyms
  for (let word of this.best_keys) {
    let row = this.chunks_dict[word]
    if (row && row.poss) {
      words_to_use = [
        ...words_to_use,
        ...((row.pos1 === "nou" || row.pos1 === "ver" || row.pos1 === "adj" || row.pos1 === "int") && row.poss[row.pos1]
          ? row.poss[row.pos1]
          : [])
      ]
    }
  }

  // hack all the words
  add_from_words.call(this, { words: [...new Set([...words_to_use])] })

  // sort words by length
  this.word_hacks = this.word_hacks.slice(0, 10)
}
