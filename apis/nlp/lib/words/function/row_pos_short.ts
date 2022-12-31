// import {
//   sort_strings_by_length_and_position,
//   sort_strings_by_rating_and_position
// } from "@techytools/fn/io/sort_strings"
// import dict_info from "@ps/nlp/lib/words/function/dict_info"

/**
 * Generates new row.pos_short from row.dict
 * ALSO row.list and row.ok_list
 * @param row {object} - DB row {key, dict, etc}
 * @param row.key {string} - key of DB row
 * @param row.dict {object} - { 'word1':[1,0,0,...], 'word2':[0,0,0,...],}
 * @returns {object} - DB row {key, dict, pos_short, list, ok_list, sentiment, etc}
 */
let DEBUG1 = false
let DEBUG2 = false
export default function (row: any = {}, options: any = {}) {
  // debug
  if (!!options.DEBUG2) {
    DEBUG2 = true
  }
  // validate
  if (!row.key) {
    return row
  }

  /*
   * compile row.pos_short
   */
  row.pos_short = {}
  row.list = []
  row.ok_list = []

  /*
   * from row.dict
   */
  /*
   * 1st, add positive words
   */
  let one_proper = 0
  let one_negative_nou = 0
  let two_negative_ver = 0
  let three_negative_adj = 0
  for (let word in row.dict) {
    // if (DEBUG2) if (word === "tues") debugger
    let info = row.dict[word]

    // skip root words and derivations
    if (!info[12]) {
      continue
    }

    // word pos
    let wpos = info[11] || info[9]
    if (!row.pos_short[wpos]) {
      row.pos_short[wpos] = []
    }

    // add to list
    if (!info[11]) {
      row.list.push(word)
    }

    // is positive
    if (info[0] === 1) {
      // is not-proper, but allow the first (just one) positive proper word to slip through!
      // this increments the var one_proper, so next time it will not pass
      if (info[1] === 0 || !one_proper) {
        // don't let the 2nd proper slip through!
        if (info[1] === 1 && one_proper === 0) {
          one_proper++
        }

        // add to ok_list
        if (!info[11]) {
          row.ok_list.push(word)
        }

        // add to pos_short
        row.pos_short[wpos].push(word)
      }
    }
  }
  /*
   * 2nd, add negative words
   */
  for (let word in row.dict) {
    // if (DEBUG2) if (word === "tues") debugger
    let info = row.dict[word]

    // skip root words and derivations
    if (!info[12]) {
      continue
    }

    // word pos
    let wpos = info[11] || info[9]
    if (!row.pos_short[wpos]) {
      row.pos_short[wpos] = []
    }

    // is negative
    if (
      row.sentiment === -1 &&
      info[0] === 0 &&
      (row.pos1 === "adj" || row.pos1 === "ver" || row.pos2 === "ver") &&
      (wpos === "adj" || wpos === "ver")
    ) {
      // is not-proper
      if (info[1] === 0) {
        // allow very negative few adjectives
        if (wpos === "adj" && three_negative_adj < 5) {
          three_negative_adj++
          row.pos_short[wpos].push(word)
        }
        // allow even fewer negative verbs
        if (wpos === "ver" && two_negative_ver < 3) {
          two_negative_ver++
          row.pos_short[wpos].push(word)
        }
        // allow even fewer negative nouns
        if (wpos === "nou" && one_negative_nou < 1) {
          one_negative_nou++
          row.pos_short[wpos].push(word)
        }
      }
    }
  }

  /*
   * sort
   */
  let pos_i = 0
  for (let pos in row.pos_short) {
    if (DEBUG1) global.cconsole.info("pos", pos)
    if (DEBUG1) global.cconsole.info("row.pos_short[pos]", row.pos_short[pos || ""])

    // only use first 5-15
    // 1. if DB mentions how many to use, follow that!
    // 2. use HALF of the synonyms, or 15, whichever is greater
    let limit = Math.min(
      row[`x${pos}`] || (pos_i === 0 ? 15 : Math.max(Math.min(15, Math.floor(row.pos_short[pos].length / 2)), 5))
    )
    row.pos_short[pos] = row.pos_short[pos].slice(0, limit)

    // sort
    // if (DEBUG1) global.cconsole.info('row.pos_short[pos]',row.pos_short[pos||''])
    pos_i++
  }

  /*
   * +negative
   * if not enough positive, add a few negative
   */
  // for (let pos in row.pos_short) {
  //
  //   // not enough good words
  //   if (limit === 30) {
  //     limit = 9
  //   }
  //   if (shorter.length < limit) {
  //     // get bad words
  //     let bad_words = []
  //     let bad_ratings: any = {}
  //     for (let word in row.dict) {
  //       // pos
  //       let info = row.dict[word]
  //       let wpos = info[11] || info[9]
  //       if (wpos !== pos) continue
  //       // use only NEGATIVE WORDS THIS TIME
  //       if (info[0] === 0 && info[1] === 0 && !isNaN(info[3])) {
  //         // add to list
  //         bad_words.push(word)
  //         bad_ratings[word] = info[3]
  //         // enough
  //         if (bad_words.length >= limit) break
  //       }
  //     }
  //     // mix bad_words into list
  //     // first, sort bad words by goodness
  //     bad_words = sort_strings_by_rating_and_position(bad_words, bad_ratings, 1)
  //     shorter = [...new Set([...shorter, ...bad_words])].slice(0, limit)
  //   }
  //
  //   // save
  //   row.pos_short[pos] = shorter
  // }

  /*
   * Then, aggregate row.pos_short.all
   */
  let all = []
  if (row.pos_short[row.pos1]) {
    all = [...all, ...row.pos_short[row.pos1].slice(0, 9)]
  }
  if (row.pos_short[row.pos2]) {
    all = [...all, ...row.pos_short[row.pos2].slice(0, 6)]
  }
  if (all.length < 9 && row.pos_short[row.pos3]) {
    all = [...all, ...row.pos_short[row.pos3].slice(0, 3)]
  }
  if (all.length < 9 && row.pos_short["etc"]) {
    all = [...all, row.pos_short["etc"][0]]
  }
  row.pos_short.all = all

  /*
   *
   * count list/ok_list
   *
   */
  row.ok_count = row.ok_list.length
  row.list_count = row.list.length
  row.sentiment = Math.round((row.ok_count / row.list_count || 0) * 100)

  /*
   *
   * Sort by length and list_count
   *
   */
  for (let pos in row.pos_short) {
    let ratings: any = {}
    for (let iword in row.pos_short[pos]) {
      let word = row.pos_short[pos][iword]
      if (!word) continue

      // idk
      let list_count = Math.ceil(Math.min(50, (row.dict[word] || [])[13] || 0) * 0.5) // max count = 50
      let length = (Math.max(word.length, 5) + 5) * 0.5 // lessen importance of short words
      ratings[word] = Math.round(list_count / length)
      if (DEBUG1) global.cconsole.log(word, [list_count, length, ratings[word]])

      // promote derivations to the front
      if (word.substring(0, 3) === row.key.substring(0, 3)) {
        row.pos_short[pos].splice(iword, 1)
        row.pos_short[pos].unshift(word)
      }
    }
    // if (DEBUG2) global.cconsole.log('before sort_strings_by_rating_and_position()', typeof row.pos_short[pos], typeof ratings)
    // row.pos_short[pos] = sort_strings_by_rating_and_position(row.pos_short[pos], ratings, 1)
    // if (DEBUG2) global.cconsole.log('after sort_strings_by_rating_and_position()')
  }

  /*
   *
   * return
   *
   */
  return row
}
