import arr_from_value from "@techytools/fn/io/arr/arr_from_value"
/**
 * Simple suggestions - using Markov Strings
 *      Creates suggestions, and appends them to existing list
 * @params pos1 {string} - first part of speech to find and use
 * @params pos2 {string} - second part of speech to find and use
 * @returns  {array} - array of arrays (each child array value is a word)
 */
let DEBUG1 = false
export default function (pos1, pos2, chunks_keys) {
  let { chunks_dict } = this
  let lists_of_phrases = []
  /*
   * Inside each "suggestions___" list, item data is an array of words:
   * ['best','coffee','in','the','universe']
   */
  // output lists - use helper lists, are output as result
  let suggestions1 = []
  // helper lists - get populated first, not output
  let pos1_before = []
  let pos1_list = []
  let pos2_list = []
  let pos2_before = []
  let pos2_after = []
  /*
   *
   * MAKE LISTS
   *
   * fill with words, to be used later
   *
   */
  for (let key of chunks_keys) {
    if (!key) continue
    let row = chunks_dict[key]
    /*
     * POS 2
     */
    if (
      row.key.length <= 1 ||
      (["pre", "pro", "det", "con"].includes(row.pos1) && row.pos1 !== pos2 && row.pos2 !== pos2) // unless I meant to use helper morpheme, then ok
    ) {
      // skip helper morphemes
    } else {
      // use pos2 from multiple chunks,
      // but it has to come after the first pos1 chunk
      if (pos1_list.length && row.poss[pos2]) {
        // 2nd list = "after" pos2
        if (row.poss && row.poss.pos_after && row.poss.pos_after[pos2]) {
          pos2_after = [...pos2_after, ...row.poss.pos_after[pos2]]
        }
        // 2nd list = "before" pos2
        if (!pos2_before.length) {
          if (row.poss && row.poss.pos_before && row.poss.pos_before[pos2]) {
            pos2_before = [...pos2_before, ...row.poss.pos_before[pos2]]
          }
        }
        // 2nd list = pos2
        if (!pos2_list.length) {
          pos2_list = [...pos2_list, ...row.poss[pos2].filter((word) => word.length < 12)]
        }
        // continue
      }
    }
    /*
     * POS 1
     */
    if (
      row.key.length <= 1 ||
      (["pre", "pro", "det", "con"].includes(row.pos1) && row.pos1 !== pos1 && row.pos2 !== pos1) // unless I meant to use helper morpheme, then ok
    ) {
      // skip helper morphemes
    } else {
      // use pos1 from only first pos1 chunk
      if (row.poss[pos1]) {
        // 1st list = pos1
        pos1_list = [...pos1_list, ...row.poss[pos1]]
        // 1st list = "before" pos1
        if (!pos1_before.length) {
          if (row.poss && row.poss.pos_before && row.poss.pos_before[pos1]) {
            pos1_before = [...pos1_before, ...row.poss.pos_before[pos1]]
          }
        }
        // continue
      }
    }
  }
  if (DEBUG1) {
    global.cconsole.log(pos1, pos2)
    if (pos1_before && pos1_before.length) {
      console.log("pos1_before", pos1_before)
    }
    if (pos1_list && pos1_list.length) {
      console.log("pos1_list", pos1_list)
    }
    if (pos2_list && pos2_list.length) {
      console.log("pos2_list", pos2_list)
    }
    if (pos2_before && pos2_before.length) {
      console.log("pos2_before", pos2_before)
    }
    if (pos2_after && pos2_after.length) {
      console.log("pos2_after", pos2_after)
    }
  }
  /*
   * Combine words
   * if both pos lists available, combine their words into phrases
   */
  if (pos2_list.length && pos1_list.length) {
    // If only one word available, make array by filling with one value
    if (pos2_list.length > 1 && pos1_list.length === 1) {
      pos1_list = arr_from_value(pos1_list[0], Math.min(12, pos2_list.length))
    }
    if (pos1_list.length > 1 && pos2_list.length === 1) {
      pos2_list = arr_from_value(pos2_list[0], Math.min(12, pos1_list.length))
    }
    // pos1/pos2
    let max_length = Math.floor(Math.min(12, pos2_list.length, pos1_list.length))
    for (let i = 0; i < max_length; i++) {
      // pos1
      if (pos1_list[i].length <= pos1_list[0].length) {
        // do "first" only
        add_phrase_arr_to_list(suggestions1, pos1_list[i], pos2_list[0])
      }
      // pos2
      if (pos2_list[i].length <= pos2_list[0].length) {
        // do "second" only
        add_phrase_arr_to_list(suggestions1, pos1_list[0], pos2_list[i])
      }
      // both
      if (pos1_list[i] && pos2_list[i]) {
        add_phrase_arr_to_list(suggestions1, pos1_list[i], pos2_list[i])
      }
    }
    // before/after
    let max_length_ba = Math.min(max_length, Math.max(pos1_before.length, pos2_after.length))
    for (let i = 0; i < max_length_ba; i++) {
      // before
      add_phrase_arr_to_list(suggestions1, pos1_before[i], pos2_list[0])
    }
  }
  // suggestions1.shift();
  lists_of_phrases.push(suggestions1)
  /*
   *
   * COMBINE -> ONE LIST
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
  return onelist
}
/**
 * Helper function
 * @param list
 * @param word1
 * @param word2
 */
function add_phrase_arr_to_list(list, word1, word2) {
  // should not equal eachother, should not equal key
  if (word1 && word2 && word1 !== word2) {
    // add
    // if (both_pos_nouns) {
    //   // if both nouns, then put shorter noun first
    //   // but only if MUCH SHORTER, if close, then treat as normally
    //   if ((word2.length + 1) < word1.length) {
    //     list.push([word2, word1])
    //   } else {
    //     list.push([word1, word2])
    //   }
    // } else {
    // else, put in original order
    list.push([word1, word2])
    // list.push([...word1.split(' '), ...word2.split(' ')])
    // }
  }
}
