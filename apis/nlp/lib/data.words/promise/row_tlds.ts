import key_tlds from "./key_tlds"
import categories from "@techytools/constants/data/domains/categories"
import all_preferences from "@techytools/constants/data/domains/all_preferences.js"
import all from "@techytools/constants/data/domains/all"
import { sort_strings_by_rating_and_position } from "@techytools/fn/io/sort_strings"
import arr_remove_item from "@techytools/fn/io/arr/arr_remove_item"
import row_model from "../function/row_model"
import fw_words from "@techytools/constants/data/words/fw/words"
import fw_tlds from "@techytools/constants/data/words/fw/tlds"
import fw2pos from "@techytools/constants/data/words/fw/fw2pos"
import fw from "@techytools/constants/data/words/fw/fw"
import { performance } from "perf_hooks"

/**
 * (promise) add row.tlds
 * @params row {object}
 * @params row.key {string}
 * @params row.root {string}
 * @params row.singular {string}
 * @params row.plural {string}
 * @params row.abbreviation {string}
 * @params row.acronym {string}
 * @params row.pos1 {string}
 * @params row.pos2 {string}
 * @params row.word_count {number}
 * @params row.dict {object}
 * @resolves row {object} - DB row {key, root, singular, etc}
 * @resolves row.tlds {array} - list of 3 lists of tlds
 */
let DEBUG_TIME = false
let debug_time_since
let debug_time = function (message) {
  let time = performance.now()
  if (debug_time_since && message) {
    global.cconsole.log(`DEBUG_TIME ${message} = `, Math.round((time - debug_time_since) / 10) / 100)
  }
  debug_time_since = time
}
const DEBUG1 = false
const DEBUG2 = false
export default function (row) {
  return new Promise(async (resolve) => {
    // time
    if (DEBUG_TIME) debug_time("")
    if (!row) {
      throw new Error("!row in row_tlds")
    }
    /*
     *
     * 1) make tlds from key
     *
     */
    let row_tlds = [[], [], [], []] // experimental - disable self! (await key_tlds(row.key)) Only aggregate meaning from synonyms!
    if (DEBUG1) global.cconsole.warn(row.key, "from DB", row_tlds)

    /*
     * Always include derivations - even if stopword
     */
    let derivations = [row.key]
    if (row.singular || row.plural) {
      derivations.push(row.singular || row.plural)
    }
    if (row.acronym || row.abbreviation) {
      derivations.push(row.acronym || row.abbreviation)
    }
    if (row.root) {
      derivations.push(row.root)
    }
    for (let syn of derivations) {
      syn = syn.toLowerCase()
      if (all[syn]) {
        row_tlds[0].push(syn)
      }
    }
    // STOP HERE if STOPWORD
    if (row.aux || !row.list_count) {
      row.tlds = row_tlds
      resolve(row)
      return
    }
    /*
     *
     * Build row.TLDS - from synonyms
     * Skip this step if word is a phrase (forgive it, ok not to have tlds)
     *
     */
    let occured1: any = {}
    let occured2: any = {}
    let occured3: any = {}
    let occured4: any = {}
    let occured5: any = {}
    let occured6: any = {}
    let syns_checked = 0
    if (DEBUG2) global.cconsole.log(`get key_tlds() for synonyms of key="${row.key}" row_tlds=`, row_tlds)
    // aggregate into a flat list (dictionary, counting appearances)
    // word {string}: how many times it appears {number}
    for (let syn of [...row.poss[row.pos1].slice(0, 7)]) {
      // Exact match -- syn=tld
      if (all[syn]) {
        row_tlds[0].push(syn)
      }
      // ILIKE matches in DB
      if (DEBUG2) global.cconsole.log(`get key_tlds() for syn="${syn}" of key="${row.key}"`)
      // make list from synonym
      let tlds: any = await key_tlds(syn)
      if (DEBUG2) global.cconsole.log(tlds)
      // no more tlds[0,1,2] - only flat list
      // if occurs 3 times, promote to [0]
      // if 2 times, promote to [1], else [2]
      for (let tld of tlds) {
        if (occured6[tld]) {
          // nominate to promote
          row_tlds[0].push(tld)
        } else if (occured5[tld]) {
          // nominate to promote
          occured6[tld] = 1
        } else if (occured4[tld]) {
          // nominate to promote
          occured5[tld] = 1
          row_tlds[1].push(tld)
        } else if (occured3[tld]) {
          // nominate to promote
          occured4[tld] = 1
        } else if (occured2[tld]) {
          // nominate to promote
          occured3[tld] = 1
        } else if (occured1[tld]) {
          // nominate to promote
          occured2[tld] = 1
          row_tlds[2].push(tld)
        } else {
          // nominate to promote
          occured1[tld] = 1
        }
      }
    }

    /*
     *
     * If name... maybe add some tlds?
     *
     */
    if (row.name) {
      row_tlds[3] = ["me", "inc", "works", "gallery", "solutions", "studio", "moi", "us", ...row_tlds[3]]
    }

    /*
     *
     * If tech... maybe add some tlds?
     *
     */
    if (row.tech) {
      row_tlds[3] = [...row_tlds[3], "cloud", "dev", "io", "co", "app", "ai", "tech"]
    }
    // time
    if (DEBUG_TIME) debug_time("everything until key_tlds")

    /*
     *
     * Insert categories list - AFTER SORTING - so it does not get sorted to top
     *
     */
    for (let dict of categories) {
      // inspect top several tlds, in reverse
      let arrs = [[row.key, ...row_tlds[0]], row_tlds[1].slice(0, 3), row_tlds[2].slice(0, 1)]
      for (let arr_i in arrs) {
        let arr = arrs[arr_i]
        for (let tld of arr) {
          // if have category suggestions for it, remove
          if (dict[tld]) {
            // add tlds from category
            row_tlds[arr_i] = [...row_tlds[arr_i], ...Object.keys(dict)]
            // log
            if (DEBUG2) global.cconsole.log("." + tld + " => category => ", arr)
          }
        }
      }
    }
    if (DEBUG1) global.cconsole.log("after categories.reverse")

    /*
     *
     * If user types in "street", give them ".st"
     *
     */
    if (all[row.abbreviation]) {
      row_tlds[2].unshift(row.abbreviation)
    }
    if (all[row.acronym]) {
      row_tlds[2].unshift(row.acronym)
    }
    if (DEBUG1) global.cconsole.log("after abbreviations")

    /*
     * Combine, unique
     */
    if (DEBUG1) {
      global.cconsole.warn(row.key + " syns tlds", row_tlds)
    }
    // time
    if (DEBUG_TIME) debug_time("key_tlds " + syns_checked)

    /*
     *
     * Manual added TLDs
     *
     */
    if (row.tlds0) {
      // add, in reverse - start with last item
      // because using [].unshift()
      let tlds0 = row.tlds0
        .split(",")
        .map((tld) => tld.trim())
        .filter((tld) => !!tld)
        .reverse()
      if (tlds0.length) {
        for (let tld of tlds0) {
          if (!tld) continue
          if (tld[0] === "-") {
            tld = tld.substr(1)
            if (!tld) continue
            // remove item (because starts with "-")
            row_tlds[3] = arr_remove_item(row_tlds[3], tld)
            row_tlds[2] = arr_remove_item(row_tlds[2], tld)
            row_tlds[1] = arr_remove_item(row_tlds[1], tld)
            row_tlds[0] = arr_remove_item(row_tlds[0], tld)
          } else if (row_tlds[0].length > 10) {
            // add to middle (already enough in top)
            row_tlds[0].unshift(tld)
          } else {
            // add to top (not enough in top - fill)
            row_tlds[1].unshift(tld)
          }
        }
      }
    }
    if (DEBUG1) global.cconsole.log("after manual tlds0")

    /*
     *
     * 4) If user types in "HIV", give them ".hiv"
     *
     */
    if (all[row.root]) {
      row_tlds[2].unshift(row.root)
    }
    if (all[row.plural]) {
      row_tlds[2].unshift(row.plural)
    }
    if (all[row.singular]) {
      row_tlds[2].unshift(row.singular)
    }
    if (all[row.key]) {
      row_tlds[2].unshift(row.key)
    }
    if (DEBUG1) global.cconsole.log("after unshift derivations")

    /*
     *
     * if FUNCTION WORD, do not use thesaurus synonyms -
     * - instead use words from list
     *
     */
    /*
     * is Stopword
     */
    let fw_pos = ""
    let fw_cat = fw[row.key]
    if (fw_cat) {
      if (fw_cat.length === 3) {
        fw_pos = fw_cat
      } else {
        fw_pos = fw2pos[fw_pos]
      }
    }
    if (fw_pos) {
      // reset thesaurus content
      let old_list_count = row.list_count || 0
      // reset row!
      row = row_model({ key: row.key, pos1: fw_pos, aux: true })
      // fix list_count, so when using this for chunking words,
      // so real words like "to" don't give 0 count
      row.list_count = old_list_count > 25 ? old_list_count : 25

      // add content from list
      let syns = fw_words[fw_cat]
      if (syns) {
        for (let word of syns) {
          // to poss
          if (row.add_syn) {
            row.add_syn(word)
          }
        }
      }

      // add custom domains
      let add_tlds = fw_tlds[fw_cat]
      if (add_tlds && add_tlds.map) {
        add_tlds.forEach(function (tld, i) {
          if (i < 10) {
            row_tlds[2].push(tld)
          } else {
            row_tlds[3].push(tld)
          }
        })
      }
    } else if (["con", "det", "pre"].includes(row.pos1)) {
      // reset TLDs for aux words
      row_tlds = [[], [], []]
    }

    /*
     *
     * 5) Save to row, de-dupe (make unique)
     *
     */
    row.tlds = [[], [], [], []] // default, permanent, for output
    let saved: any = {}
    for (let tld of row_tlds[0]) {
      if (!saved[tld]) {
        row.tlds[0].push(tld)
        saved[tld] = true
      }
    }
    for (let tld of row_tlds[1]) {
      if (!saved[tld]) {
        row.tlds[1].push(tld)
        saved[tld] = true
      }
    }
    for (let tld of row_tlds[2]) {
      if (!saved[tld]) {
        row.tlds[2].push(tld)
        saved[tld] = true
      }
    }
    for (let tld of row_tlds[3]) {
      if (!saved[tld]) {
        row.tlds[3].push(tld)
        saved[tld] = true
      }
    }

    /*
     *
     * Sort by preference
     *
     */
    row.tlds[0] = sort_strings_by_rating_and_position(row.tlds[0], all_preferences, 1)
    row.tlds[1] = sort_strings_by_rating_and_position(row.tlds[1], all_preferences, 1)
    row.tlds[2] = sort_strings_by_rating_and_position(row.tlds[2], all_preferences, 1)
    row.tlds[3] = sort_strings_by_rating_and_position(row.tlds[3], all_preferences, 1)
    if (DEBUG1) global.cconsole.log("after sort")

    /*
     *
     * is Digit
     *
     */
    if ((row.abbreviation && !isNaN(row.abbreviation)) || (row.key && !isNaN(row.key))) {
      row.tlds[1] = []
      row.tlds[2] = []
      row.tlds[3] = []
    }

    /*
     *
     * .gay
     *
     */
    if (row.sentiment === -1) {
      for (let level in row.tlds) {
        {
          let gay_i = row.tlds[level].indexOf("gay")
          if (gay_i !== -1) {
            row.tlds[level].splice(gay_i, 1)
          }
        }
        let gay_i = row.tlds[level].indexOf("lgbt")
        if (gay_i !== -1) {
          row.tlds[level].splice(gay_i, 1)
        }
      }
    }

    /*
     *
     * Return
     *
     */
    // time
    if (DEBUG_TIME) debug_time("everything after key_tlds")
    if (DEBUG1) global.cconsole.warn(row.key, "final", row.tlds)
    resolve(row)
  })
}
