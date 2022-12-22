/**
 * Derive phrases from a single word - by looking at words which come "before" and "after" it
 * @params row {object} - word DB row (self)
 * @returns  {array} - array of arrays (each child array value is a word)
 */
export default function (row) {
  if (!row || !row.poss || (!row.poss["bef"] && !row.poss["aft"])) {
    return []
  }
  let lists_of_phrases = []

  /*
   *
   * AFTER
   *
   */
  // if (row.poss["aft"]) {
  //   // prepare phrase words
  //   let words_after = []
  //   let list = row.poss["aft"]
  //   if (list) {
  //     for (let word of list) {
  //       words_after.push(word)
  //     }
  //   }
  //   // construct phrases
  //   let phrases_after = []
  //   for (let word of words_after) {
  //     if (word.length >= 2 && word.length <= 8) {
  //       add_phrase_arr_to_list(phrases_after, row.key, word)
  //     }
  //   }
  //   // save
  //   lists_of_phrases.push(phrases_after)
  // }

  /*
   *
   * BEFORE
   *
   */
  if (row.poss["bef"]) {
    // prepare phrase words
    if (row.poss["bef"]) {
      // construct phrases
      let phrases_before = []
      for (let word of row.poss["bef"]) {
        add_phrase_arr_to_list(phrases_before, word, row.key)
      }
      // save
      if (phrases_before.length) {
        lists_of_phrases.push(phrases_before)
      }
    }
  }

  /*
   *
   * COMBINE -> INTO ONE LIST
   *
   */
  let onelist = [] // output
  // loop over all lists a few times
  for (let li = 0; li < 50; li++) {
    /*
     * Each list
     */
    for (let list of lists_of_phrases) {
      // reached the end
      if (!list[li]) continue
      // one phrase at a time
      let words = list[li]
      // save
      onelist.push(words)
    }
  }

  return onelist.slice(0, 10)
}

/**
 * Helper function: add phrase array to list
 * @param list {array} - greater list, to add into
 * @param word1 {string} - will be arr[0] of phrase arr added to list
 * @param word2 {string} - will be arr[1] of phrase arr added to list
 */
function add_phrase_arr_to_list(list, word1, word2) {
  // should not equal eachother, should both be defined
  if (word1 && word2 && word1 !== word2) {
    // add
    list.push([word1, word2])
  }
}
