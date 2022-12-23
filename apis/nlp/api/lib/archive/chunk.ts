import str_row from "@ps/nlp/api/endpoints/data.words/promise/str_row"
import wordbreak from "@ps/nlp/api/lib/words/wordbreak"
import str_insert from "@techytools/fn/io/str/str_insert"
import spellcheck from "@ps/nlp/api/lib/words/spellcheck"

/**
 * Domain extensions suggestions
 * @params string {string} - query phrase
 * @params tld {string} - TLD if specified - otherwise will be parsed from string
 * @returns data {object} - TBD
 */
// for development... after DB is rebuilt, set to false (or undefined to use str_row.js default)
let REBUILD = true
let REBUILD_END = true
let DEBUG_TIME = false
let debug_time_since
let debug_time = function (message: string | number = "") {
  let time = Date.now()
  if (debug_time_since && message) {
    global.cconsole.log(`DEBUG_TIME ${message} = `, Math.round((time - debug_time_since) / 10) / 100)
  }
  debug_time_since = time
}
let DEBUG1 = false
let DEBUG2 = false
let DEBUG3 = false
const mymodule = async function (string, tld = "com") {
  if (DEBUG_TIME) debug_time()
  /*
   *
   *    Important local variables:
   *        chunks_rows {object} - dictionary of all chunked rows (chunk is word entry in DB)
   *            { chunk string: object from DB, }
   *        chunks_keys {array of arrays} - list of chunked phrases
   *            ONLY add key to this list if there is a corresponding value in the dictionary (chunks_rows)
   *            IMPORTANT: last item in chunks_keys should always be individual words
   *        string_arr {array} - string.split(' '), whenever parse new chunks, update to reflect newly understood string
   *            string_arr should be longest list of words, and the last item in chunks_keys array
   */

  /*
   * filter/validate
   */
  string = string
    .replace(/([A-Z]+)/g, " $1")
    .replace(/([0-9]+)/g, " $1 ")
    .toLowerCase()
    .trim()
  if (tld) {
    tld = tld.trim().toLowerCase()
  }
  let options: any = { REBUILD, DEBUG_TIME }
  let chunks_keys = [] // parse string into low/medium/highest resolution substrings
  // ^- "united states of america" = highest; "united states" = medium; "united" = lowest;
  let chunks_rows: any = {} // only real rows from DB get saved here

  /*
   * use dashes ? spellcheck ?
   */
  if (string.includes("-")) {
    options.string_includes_dashes = true
  }
  if (string.includes('"')) {
    options.do_not_spellcheck = true
  }

  /*
   * parse extension from input string (string contains ".")
   */
  let doti
  if (tld === "com") {
    doti = string.indexOf(".")
    if (doti > -1) {
      tld = string.substr(doti + 1).trim()
      string = string.substr(0, doti).trim()
    }
  }

  /*
   * special cases
   */
  if (string === "samiali") string = "sami ali"
  if (string === "hellosamiali") string = "hello sami ali"

  /*
   *
   *
   * STRING
   *
   *
   */
  // only keep the first part, before the ".com"
  string = string.split(".")[0]
  // remove quotes
  string = string.replace(/"+/g, " ")
  // remove special characters
  string = string.replace(/[^\d\p{L}\-_]+/gu, " ").trim()
  // add spaces around numbers
  let d1 = string.match(/[\w]{1}[0-9]+/g)
  if (d1 && !isNaN(d1.index)) {
    for (let str of d1) {
      // only do this if - first character is a letter
      // otherwise, it's already a space, keep as is
      if (!str[0].match(/\w/)) continue
      // found digit, which comes after a letter
      // now, correct its index - skip the one letter
      let d1_i_start = d1.index + 1
      let d1_i_end = d1_i_start + d1[0].length
      // insert space into this index
      string = str_insert(string, d1_i_start, " ")
      if (DEBUG1) global.cconsole.warn(`adding space to string "${string}" at index "${d1_i_start}"`)
      d1_i_start++
      // find index of next letter, after the digit
      let w = string.substr(d1_i_start).match(/[^\d\s]{1}/)
      if (w) {
        if (w.index > 0) {
          string = str_insert(string, d1_i_start + w.index, " ")
          if (DEBUG1) global.cconsole.warn(`adding space to string "${string}" at index "${w.index}"`)
        }
      }
    }
  }
  // remove duplicate spaces
  string = string.replace(/[ ]+/g, " ")
  // time
  if (DEBUG_TIME) debug_time("preliminary")

  /*
   *
   *
   *
   * Lowest resolution (entire phrase)
   * ORIGINAL (no modification)
   *    Use to construct "original" suggestions, even if can't parse
   *    If parsed, then use this for higher resolution chunks
   *
   *
   *
   */
  let string_arr = string.split(" ")
  let string_original = string
  let row_original: any = await str_row(string, { model: false, REBUILD: REBUILD })
  // save if found in database
  if ((row_original && row_original.list_count >= 5) || row_original.name || row_original.brand) {
    chunks_keys.push(string_arr)
    chunks_rows[string] = row_original
    // if (row_original.name || row_original.brand) {
    if (row_original.list_count > 15) {
      options.do_not_chunk = true
    }
    // options.do_not_chunk = true
  }
  // time
  if (DEBUG_TIME) debug_time("lowest resolution - original phrase")
  if (DEBUG2) global.cconsole.debug("chunks after original", chunks_keys)

  /*
   *
   *
   *
   * MICROSOFT BING AZURE WORD-BREAK
   *
   *
   *
   */
  let time_spellchecked = Date.now()
  let bing_alts = [] //
  if (!row_original || !row_original.list_count || row_original.list_count <= 15) {
    // alt data
    let found: any = await spellcheck(string_original)

    // alt word
    if (found.spellchecked !== string) {
      string = found.spellchecked
      string_arr = string.split(" ")
      options.do_not_chunk = true
    }
    if (DEBUG3) global.cconsole.warn("found spellcheck string = " + found.spellchecked)

    // alt chunk
    let row: any = await str_row(string, { REBUILD: REBUILD, model: false })
    if (DEBUG3 && row) {
      global.cconsole.warn("found spellcheck row = ", {
        key: row.key,
        list_count: row.list_count,
        pos1: row.pos1
      })
    }
    if (row && row.list_count) {
      string_arr = [row.key]
      chunks_keys.push(string_arr)
      chunks_rows[row.key] = row
      options.do_not_chunk = true
    }

    // alts
    if (found.suggestions.length) {
      bing_alts = []
      for (let i = 0; i < 10; i++) {
        let tuple = found.suggestions[i]
        if (tuple && tuple[0]) {
          bing_alts.push(tuple[0])
        }
      }
    }
  }
  // debug
  if (DEBUG3 || DEBUG_TIME) debug_time("bing spellcheck/autosuggest")
  if (DEBUG3 || DEBUG_TIME) {
    global.cconsole.info("DEBUG TIME SPELLCHECK/AUTOSUGGEST", ((Date.now() - time_spellchecked) / 1000).toFixed(2))
  }

  /*
   *
   *
   *
   * MANUALLY CHUNK (word break to find extra meaning)
   *
   *
   *
   */
  if (string_arr.length <= 1) {
    let broken: any = await wordbreak(string)
    if (broken.length > 1) {
      // sanitize
      broken = broken.map((str) => str.replace(/[^\w\d\-]+/g, ""))
      // use
      string_arr = broken
      string = string_arr.join(" ")
      chunks_keys.push(string_arr)
      // chunks
      for (let key of string_arr) {
        let row: any = await str_row(key, { REBUILD: REBUILD, model: true })
        if (row) {
          chunks_rows[row.key] = row
        }
      }
    }
  }
  if (DEBUG2) global.cconsole.debug("chunks after wordbreak", chunks_keys)

  /*
   *
   *
   *
   * Highest resolution (if user included spaces, or Bing Spellcheck found spaces)
   * ["united", "states", "of", "america"], ["peanut", "butter", "jelly", "time"]
   * assume input is separated by spaces, because it should be, from bing_spellcheck()
   *
   *
   *
   */
  // if multiple words, but meaning only found for full phrase, not individual words
  if (string_arr.length > 1 && chunks_keys.length <= 1) {
    let found_keys = []
    for (let key of string_arr) {
      if (!key) continue
      if (chunks_rows[key]) continue
      // get DB row for each highest resolution chunk
      // if not exist, save placeholder model
      // these are the individual word of a phrase.
      let row: any = await str_row(key, { REBUILD: REBUILD })
      // if (DEBUG2) global.cconsole.warn("key, row", key, Object.keys(row))
      if (row && row.key) {
        found_keys.push(row.key)
        chunks_rows[row.key] = row
      }
    }
    if (found_keys.length) {
      if (found_keys.length >= string_arr.length) {
        // new highest resolution = string_arr
        // string_arr should be longest list of words, and be last in chunks_keys
        string_arr = found_keys
        chunks_keys.push(string_arr)
      } else {
        // add some words, keep string_arr as is
        chunks_keys.push(found_keys)
      }
    }
  }
  // time
  if (DEBUG_TIME) debug_time("highest resolution - if chunked")
  if (DEBUG2) global.cconsole.debug("chunks after highest resolution", chunks_keys)

  /*
   *
   *
   *
   *
   * Middle resolution (phrase phrase in phrase)
   * `"united states" of america`, `"peanut butter" jelly time`
   *
   *
   *
   *
   */
  if (string_arr.length >= 3) {
    // search backwards
    // start: first word until the **second to last word**
    // end: first word until the **second word**
    let i_from = 0
    for (let i_to = string_arr.length - 1; i_to > 1; i_to--) {
      let words_slice = string_arr.slice(i_from, i_to)
      let key = words_slice.join(" ").trim()
      if (DEBUG2) global.cconsole.info(`middle resolution backward = "${key}"`)
      let row: any = await str_row(key, { REBUILD: REBUILD })
      // save only if its a good phrase! if enough synonyms
      if (row && row.list_count >= 10) {
        if (DEBUG1) global.cconsole.success("middle resolution backward - added row", key)
        /*
         * found subphrase!
         */
        // if (row.list_count >= 25) {
        // splice individual words rows => new phrase row
        // string_arr always points to the new index
        string_arr = [...string_arr]
        string_arr.splice(i_from, i_to - i_from, key)
        chunks_keys.splice(chunks_keys.length - 1, 0, string_arr)
        chunks_rows[key] = row
      }
    }
    // search forward
    // start: **second word** until last word
    // end: **second to last word** until last word
    let i_to = string_arr.length
    for (let i_from = 1; i_from < string_arr.length - 1; i_from++) {
      let words_slice = string_arr.slice(i_from, i_to)
      let key = words_slice.join(" ").trim()
      if (DEBUG2) global.cconsole.info(`middle resolution forward = "${key}"`)
      let row: any = await str_row(key, { REBUILD: REBUILD })
      // save only if its a good phrase! if enough synonyms
      if (row && row.list_count >= 10) {
        if (DEBUG1) global.cconsole.success("middle resolution forward - added row", key)
        /*
         * found subphrase!
         */
        // if (row.list_count >= 25) {
        // splice individual words rows => new phrase row
        // string_arr always points to the new index
        string_arr.splice(i_from, i_to - i_from, key)
        chunks_rows[key] = row
      }
    }
  }
  // time
  if (DEBUG_TIME) debug_time("middle resolution")
  if (DEBUG2) global.cconsole.debug("after middle resolution", string, chunks_keys)
  // debug
  if (DEBUG2) global.cconsole.debug("chunks_keys", chunks_keys)
  if (DEBUG2) global.cconsole.debug("string ", string)
  if (DEBUG2) global.cconsole.debug("string_arr ", string_arr)
  if (DEBUG2) global.cconsole.debug("chunks_rows ", Object.keys(chunks_rows))

  /*
   *
   *
   * If ["phrase of words"] is better than ["phrase", "of", "words"],
   * then remove individual words
   *
   *
   */
  // for (let key in chunks_rows) {
  //   // phrase key
  //   if (!key.includes(" ")) continue
  //   // phrase is good enough on its own
  //   let prow = chunks_rows[key]
  //   if (prow.list_count >= 25) {
  //     // remove words data
  //     for (let word of key.split(" ")) {
  //       delete chunks_rows[word]
  //     }
  //     // remove reference to words
  //     chunks_keys.pop()
  //   }
  // }

  /*
   *
   *
   *
   *
   * No chunks found, make row from string
   *
   *
   *
   *
   */
  if (!chunks_keys.length) {
    // add original full phrase
    let key = string_arr.join(" ").toLowerCase().trim()
    if (!chunks_rows[key]) {
      let row: any = await str_row(key, { REBUILD: REBUILD })
      if (row && row.list_count) {
        chunks_rows[row.key] = row
        // fix
        chunks_keys.push([row.key])
      }
    }
  }
  if (DEBUG1) global.cconsole.warn("final chunks output chunks_keys", chunks_keys)
  if (DEBUG1) global.cconsole.warn("final chunks output string_arr", string_arr)

  /*
   *
   * TLD row
   * coincidentally, the TLD is added to chunks_rows FIRST, before words/strings
   * this is good - because on the rare ocasion that this dictionary is iterated,
   * tld chunk shall be used first, as it is the most important
   *
   */
  if (tld && !chunks_rows[tld]) {
    let trow: any = await str_row(tld, { REBUILD: REBUILD })
    if (trow && trow.list_count) {
      chunks_rows[trow.key] = trow
    }
  }

  /*
   *
   *
   * TEMPORARY: refresh rows from DB, because chunk_word was using old data!
   *
   *
   */
  if (REBUILD || REBUILD_END) {
    for (let key in chunks_rows) {
      chunks_rows[key] = await str_row(key, { REBUILD: true })
    }
    if (!chunks_keys.length) {
      if (string_arr.length) {
        // populate from string_arr
        chunks_keys.push(string_arr)
        for (let key of string_arr) {
          if (!chunks_rows[key]) {
            chunks_rows[key] = await str_row(key, { REBUILD: true })
          }
        }
      } else {
        // populate from string
        let row = chunks_rows[string]
        if (!row) {
          let row: any = await str_row(string, { REBUILD: true })
          chunks_rows[row.key] = row
        }
      }
    }
  }

  /*
   *
   *
   *
   * Return
   *
   *
   *
   */
  // time
  if (DEBUG_TIME) debug_time("format output")
  return {
    string_original: string_original,
    string: string_arr.join(" ").toLowerCase(),
    tld: tld,
    chunks_keys: chunks_keys, // lowercase already been applied when added to
    chunks_rows: chunks_rows, // lowercase already been applied when added to
    options: options,
    bing_alts: bing_alts
  }
}
export default mymodule
