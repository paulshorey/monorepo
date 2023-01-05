import str_row from "./str_row"
import tlds from "@techytools/constants/data/domains/all"
import names from "@techytools/constants/data/words/names"

/**
 * (function) add row.poss
 * @param row {object}
 * @returns row {object} - DB row {key, syns1, etc}
 */
let DEBUG1 = false
let DEBUG2 = false // find what's broken or blocking
export default async function (row, options?: any) {
  row.poss = { [row.pos1]: [] }

  /*
   *
   * What synonyms to use for suggestions ? Sort
   *
   */
  // if function word, don't bother building - will be reset below
  if (row.pos1 && row.pos1 !== "con" && row.pos_short[row.pos1]) {
    row.poss[row.pos1] = row.pos_short[row.pos1].filter((word) => word.length <= 13).slice(0, 15)
  }
  if (row.pos2 && row.pos2 !== "con" && row.pos_short[row.pos2]) {
    row.poss[row.pos2] = row.pos_short[row.pos2].filter((word) => word.length <= 13).slice(0, 13)
  }
  if ({ int: 1, pro: 1 }[row.pos1]) {
    if ({ nou: 1, ver: 1, adj: 1, adv: 1, int: 1 }[row.pos3] && row.pos_short[row.pos3]) {
      row.poss[row.pos3] = row.pos_short[row.pos3].filter((word) => word.length <= 13).slice(0, 5)
    }
  }
  if (row.pos_short["bef"]) {
    row.poss["bef"] = row.pos_short["bef"].filter((word) => word.length <= 13).slice(0, 3)
  }
  if (row.pos_short["aft"]) {
    row.poss["aft"] = row.pos_short["aft"].filter((word) => word.length <= 13).slice(0, 2)
  }

  /*
   *
   * If PLURAL, include SINGULAR row.poss
   *
   */
  if (!tlds[row.key]) {
    let row2 = undefined
    if (row.singular && row.singular !== row.key && row.singular !== row.str && row.singular !== row.plural) {
      row2 = await str_row(row.singular)
    } else if (row.plural && row.plural !== row.key && row.plural !== row.str) {
      row2 = await str_row(row.plural, { REBUILD: false })
    }
    // } else if (row.root && row.root !== row.key && row.root !== row.str) {
    //   row2 = await str_row(row.root, {REBUILD:false})
    // }
    if (row2 && row2.list_count && row2.pos1 === row.pos1 && row2.pos1 === row.pos1) {
      /*
       * debug
       */
      if (DEBUG2) global.cconsole.log("row2 found", row2.key, row2.pos1)
      /*
       * combine counts
       */
      // apply to singular version only
      if (row2.singular === row.key || row2.key === row.plural) {
        if (row.list_count < 50) {
          row.list_count += row2.list_count
        }
      }
      /*
       * apply only for singular row2
       */
      if (row2.plural === row.key) {
        /*
         * merge in tlds from singular row
         */
        if (row2.tlds) {
          let all_tlds: any = {}
          for (let level of [0, 1, 2]) {
            // 0) collect new unique tlds
            let level_list = []
            // 1) iterate each existing tld, add to dict
            for (let tld of row.tlds[level]) {
              if (!all_tlds[tld]) {
                all_tlds[tld] = true
                level_list.push(tld)
              }
            }
            // 2) iterate all tld for this level
            // build new full list for this level,
            // EXCLUDING tlds which were already used in previous levels
            for (let tld of row2.tlds[level]) {
              if (!all_tlds[tld]) {
                all_tlds[tld] = true
                level_list.push(tld)
              }
            }
            // 3) replace current list with new unique one
            row.tlds[level] = level_list
          }
        }
        /*
         * merge in poss from singular row
         */
        if (row2.poss) {
          for (let pos in row2.poss) {
            if (row.poss[pos]) {
              let dict: any = {}
              let list = []
              for (let li = 0; li < Math.max(row.poss[pos].length, row2.poss[pos].length); li++) {
                if (row.poss[pos][li] && !dict[row.poss[pos][li]]) {
                  dict[row.poss[pos][li]] = true
                  list.push(row.poss[pos][li])
                }
                if (row2.poss[pos][li] && !dict[row2.poss[pos][li]]) {
                  dict[row2.poss[pos][li]] = true
                  list.push(row2.poss[pos][li])
                }
              }
              row.poss[pos] = list
            }
          }
        }
      }
    } else {
      if (DEBUG2) global.cconsole.log("row2 NOT found", row.key, row.singular, row.plural, row.root)
    }
  }

  /*
   *
   * Do not use phrases or proper names
   *
   */
  if (DEBUG2) global.cconsole.log("rebuild row.poss")
  for (let pos in row.poss) {
    let list = row.poss[pos]
    let i = 0
    while (i < list.length) {
      let word = list[i]
      /*
       * filter out names
       */
      if (names[word] && (!row.dict[word] || row.dict[word][3] < 25)) {
        row.poss[pos].splice(i, 1)
        i--
      }
      /*
       * filter out spaces
       */
      if (word.includes(" ")) {
        row.poss[pos].splice(i, 1)
        i--
      }
      /*
       * next
       */
      i++
    }
  }

  /*
   *
   * fix before/after
   *
   */
  if (DEBUG2) global.cconsole.log("rebuild row.poss fix before/after")
  // before -
  // extrapolate from flat list, to pos dict
  for (let word in row.dict) {
    let info = row.dict[word]
    if (info[11] === "bef") {
      let pos = info[9]
      if (!row.poss.pos_before) {
        row.poss.pos_before = []
      }
      if (!row.poss.pos_before[pos]) {
        row.poss.pos_before[pos] = []
      }
      row.poss.pos_before[pos].push(word)
    }
  }

  /*
   * Fix
   */
  if (DEBUG2) global.cconsole.log("rebuild row.poss fix pos_short")
  // fix poss and pos_short
  for (let pos in row.poss || {}) {
    // fix row.poss['interrogative']
    if (pos.length > 3) {
      // skip pos_before, pos_after
      continue
    }
    // if row.pos_short does not contain poss pos
    if (!row.pos_short[pos]) {
      row.pos_short[pos] = row.poss[pos]
    }
  }
  // fix pos_short
  for (let key in row.pos_short || {}) {
    // fix row.pos_short['interrogative']
    if (key.length > 3) {
      // shorten self
      row.pos_short[key.substr(0, 3)] = row.pos_short[key]
      delete row.pos_short[key]
    }
  }

  /*
   * Fix row.dict for self (row.dict[row.key]),
   * in case something was changed and not re-processed in CLI script
   */
  // // update row.dict if root/plural/singular/sentiment were updated
  // let row_original: any = await data_word_get_parsed(row.key)
  // // just update the entire row - don't care about performance in this admin tool
  // row = { ...row_original, ...row }
  // // update row.dict info for self
  // global.cconsole.warn('adding row.key to row.dict', row.key)
  // row.dict[row.key] = dict_info(row, row.pos, false)

  /*
   *
   * fix poss[pos1]
   *
   */
  if (!row.poss) {
    row.poss = { [row.pos1]: [] }
  }
  if (!row.poss[row.pos1]) {
    row.poss[row.pos1] = []
  }

  /*
   *
   * fix if Proper
   *
   */
  if (DEBUG2) global.cconsole.log("rebuild row.poss if proper/digit")
  if (row.proper && row.list_count < 30) {
    // use only top TWO synonyms
    if (row.pos_short.all && row.pos_short.all.length) {
      row.poss = { [row.pos1]: row.pos_short.all.slice(0, 2) }
    }
    if (row.tlds && row.tlds[2]) {
      row.tlds[2] = []
    }
    row.aux = true
    row.list_count = row.list_count > 13 ? row.list_count : 13
    // return row
  }

  /*
   *
   * fix if Digit
   *
   */
  if ((row.abbreviation && !isNaN(row.abbreviation)) || (row.key && !isNaN(row.key))) {
    // use ONLY ONE synonym
    if (row.pos_short.all && row.pos_short.all.length) {
      row.poss = { [row.pos1]: row.pos_short.all.slice(0, 1) }
    }
    // return row
  }

  /*
   *
   * add selft
   *
   */
  if (!row.key.includes(" ")) {
    row.poss[row.pos1].unshift(row.key)
  }

  if (DEBUG2) global.cconsole.log("rebuild row.poss return " + typeof row)
  return row
}
