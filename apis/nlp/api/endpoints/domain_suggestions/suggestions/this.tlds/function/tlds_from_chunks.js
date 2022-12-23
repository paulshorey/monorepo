// import fws from "@ps/nlp/data/words/fw/fw"
// import sort_preferences from "@ps/nlp/data/domains/sort_preferences"
// import { sort_strings_by_rating_and_position } from "@techytools/fn/io/sort_strings"
import str_row from "../../../../data.words/promise/str_row"
import tlds_all from "@ps/nlp/data/domains/all"
/**
 * Domain extensions suggestions
 * @returns array {array} - flat list of domain extensions which match inputted chunks
 *      the domain extensions come from the chunks themselves, each chunk row.poss.domains
 */
let DEBUG1 = false
let DEBUG3 = false
export default async function () {
  let ratings = {}
  let dset0 = new Set()
  let dset1 = new Set()
  let dset2 = new Set()
  let dset3 = new Set()
  let dset4 = new Set()
  let dset5 = new Set()
  if (DEBUG1) {
    global.cconsole.log("this.keys_words", this.keys_words)
    global.cconsole.log(
      "this.chunks_dict[this.keys_words[0]].list_count",
      (this.chunks_dict[this.keys_words[0]] || {}).list_count
    )
  }
  /*
   * prefer best keys 123
   */
  for (let key of this.best_keys) {
    let add_rating = 1
    if (key === this.tld) {
      add_rating = 0
    }
    let row = this.chunks_dict[key]
    if (row.tlds) {
      if (row.tlds[0] && row.tlds[0][0]) {
        for (let t = 0; t < Math.min(row.tlds[0].length, 5); t++) {
          let tld = row.tlds[0][t]
          if (tld) add_to_set(tld, dset1, dset0, 4 * add_rating, ratings)
        }
      }
      if (row.tlds[1] && row.tlds[1][0]) {
        for (let t = 0; t < Math.min(row.tlds[1].length, 5); t++) {
          let tld = row.tlds[1][t]
          if (tld) add_to_set(tld, dset2, dset1, 3 * add_rating, ratings)
        }
      }
      if (row.tlds[2] && row.tlds[2][0]) {
        for (let t = 0; t < Math.min(row.tlds[2].length, 5); t++) {
          let tld = row.tlds[2][t]
          if (tld) add_to_set(tld, dset3, dset2, 2 * add_rating, ratings)
        }
      }
      if (row.tlds[3] && row.tlds[3][0]) {
        for (let t = 0; t < Math.min(row.tlds[3].length, 5); t++) {
          let tld = row.tlds[3][t]
          if (tld) add_to_set(tld, dset4, dset3, 1 * add_rating, ratings)
        }
      }
      break
    }
  }
  /*
   * then, add row.tlds[2] from each row
   */
  for (let t = 0; t < 20; t++) {
    for (let key in this.chunks_dict) {
      let row = this.chunks_dict[key]
      if (row.tlds[1] && !row.tlds[1].length) {
        row.tlds.splice(1, 1)
      }
      if (row.tlds[0] && !row.tlds[0].length) {
        row.tlds.shift()
      }
      if (row.tlds) {
        if (row.tlds[0] && row.tlds[0][t]) {
          let tld = row.tlds[0][t]
          if (tld) add_to_set(tld, dset2, dset1, 7, ratings)
        }
        if (row.tlds[1] && row.tlds[1][t]) {
          let tld = row.tlds[1][t]
          if (tld) add_to_set(tld, dset3, dset2, 5, ratings)
        }
        if (row.tlds[2] && row.tlds[2][t]) {
          let tld = row.tlds[2][t]
          if (tld) add_to_set(tld, dset4, dset3, 3, ratings)
        }
        if (row.tlds[3] && row.tlds[3][t]) {
          let tld = row.tlds[3][t]
          if (tld) add_to_set(tld, dset5, dset4, 1, ratings)
        }
      }
    }
  }
  /*
   *
   * count good ones - need help from autocomplete ???
   *
   */
  let ndoms = dset0.size + dset1.size + dset2.size
  if (DEBUG3) global.cconsole.debug("ndoms", ndoms)
  if (DEBUG3) global.cconsole.log(new Set([...dset0, ...dset1, ...dset2]).size)
  if (ndoms < 5) {
    this.use_autocomplete = true
    if (DEBUG3) global.cconsole.warn("use autocomplete! get TLDs from context")
  }
  /*
   * then, add row.tlds[2] from each row - get help from autocomplete
   */
  // let altset = new Set() // will contain singles, tlds which only appear once, to be discarded!
  // let altset0 = new Set() // use tld, place into tlds[0]
  // let altset1 = new Set() // use tld, place into tlds[1]
  // let altset2 = new Set() // use tld, place into tlds[2]
  // let altset3 = new Set() // use tld, place into tlds[3]
  if (this.bing_alts.length) {
    for (let alti = 0; alti < this.bing_alts.length || 0; alti++) {
      let key = this.bing_alts[alti]
      let last_word_i = key.lastIndexOf(" ")
      if (last_word_i === -1) continue
      key = key.substr(last_word_i + 1)
      // global.cconsole.log("alt", key)
      let row = this.chunks_dict[key]
      if (!row) {
        row = await str_row(key, { model: false, REBUILD: false })
        if (key.length > 2 && row && row.list_count && row.sentiment !== -1 && !row.proper) {
          // this.chunks_dict[key] = row
        } else {
          this.bing_alts.splice(alti, 1)
          alti--
          continue
        }
      }
      if (!row) {
        continue
      }
      // add key/derivations
      let ders = [row.key]
      if (row.plural) ders.push(row.plural)
      if (row.singular) ders.push(row.singular)
      if (row.root) ders.push(row.root)
      if (row.acronym) ders.push(row.acronym)
      if (row.abbreviation && typeof row.abbreviation === "string") ders.push(row.abbreviation.split(",")[0].trim())
      for (let der of ders) {
        if (tlds_all[der]) {
          add_to_set(der, dset0, dset0)
        }
      }
      // add synonyms
      for (let t = 0; t < 10; t++) {
        if (DEBUG3) global.cconsole.log(row.key, row.tlds)
        if (row.tlds) {
          if (row.tlds[0] && row.tlds[0][t]) {
            let tld = row.tlds[0][t]
            if (tld) add_to_set(tld, dset2, dset1)
          }
          if (row.tlds[1] && row.tlds[1][t]) {
            let tld = row.tlds[1][t]
            if (tld) add_to_set(tld, dset3, dset2)
          }
          if (row.tlds[2] && row.tlds[2][t]) {
            let tld = row.tlds[2][t]
            if (tld) add_to_set(tld, dset4, dset3)
          }
          if (row.tlds[3] && row.tlds[3][t]) {
            let tld = row.tlds[3][t]
            if (tld) add_to_set(tld, dset5, dset4)
          }
        }
      }
    }
  }
  // for (let tld of altset0) {
  //   add_to_set(tld, dset1, dset0, 7, ratings)
  // }
  // for (let tld of altset1) {
  //   add_to_set(tld, dset2, dset0, 5, ratings)
  // }
  // for (let tld of altset2) {
  //   add_to_set(tld, dset3, dset0, 3, ratings)
  // }
  // for (let tld of altset3) {
  //   add_to_set(tld, dset4, dset0, 1, ratings)
  // }
  /*
   * Combine
   */
  if (DEBUG1) {
    global.cconsole.info("dset0", [...dset0])
    global.cconsole.info("dset1", [...dset1])
    global.cconsole.info("dset2", [...dset2])
    global.cconsole.info("dset3", [...dset3])
    global.cconsole.info("dset4", [...dset4])
    global.cconsole.info("dset5", [...dset5])
  }
  let yes_tlds = [...dset0, ...dset1, ...dset2, ...dset3, ...dset4]
  let maybe_tlds = [...dset5]
  /*
   * Sort
   */
  // yes_tlds = sort_strings_by_rating_and_position(yes_tlds, ratings, 5)
  // maybe_tlds = sort_strings_by_rating_and_position(maybe_tlds, ratings, 5)
  // ok
  return { yes_tlds, maybe_tlds }
}
function add_to_set(tld, add_to_set, promote_to_set, rate, ratings) {
  // add to list
  if (add_to_set.has(tld) && tld !== "bot") {
    promote_to_set.add(tld)
  } else {
    add_to_set.add(tld)
  }
  // remember rating, for future sorting
  if (rate) {
    if (ratings[tld]) {
      ratings[tld] += rate
    } else {
      ratings[tld] = rate
    }
  }
}
