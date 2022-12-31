import chunk_word_forward from "./chunk_word_forward"
import chunk_word_backward from "./chunk_word_backward"
import str_row from "@ps/nlp/lib/words/promise/str_row"

/**
 * Break string into words (check rows from DB for every character)
 * @params {string} - string to break
 * @params options {object}
 * @params options.recursive {boolean} - default true; if false, will stop after chunking first wordss
 * @returns {array} - of objects, each a DB row
 */
// let STRLEN = 4 // min input string length (reject with empty response if less)
// let minlen = 2 // min extracted word length (ignore word if less)
// let MINSYN = 5 // reject DB results which have fewer than this N of synonyms
let DEBUG0 = false
let DEBUG1 = false
const thisModule = async function (string, super_options: any = {}) {
  // set parameters for this and child scripts:
  if (DEBUG1) global.cconsole.info(`chunk_word() "${string}"`)
  let MINSYN = 4
  let options: any = {
    str_row_options: {
      model: false,
      REBUILD: super_options.REBUILD ? "list_count" : false
    },
    recursive: true,
    found_backward: [],
    found_forward: [],
    chunked_rows: {},
    checked_strings: {},
    MINSYN: MINSYN
  }
  try {
    /*
     * 1ST TRY
     */
    let ch1_rows: any = {}
    let ch1_keys = []
    let ch1_str = ""
    let ch1_shortest = string.length
    let ch1_score = 0
    let ch1_str_changed = false

    // chunk
    await chunk_word_forward(string, options)
    if (DEBUG1)
      global.cconsole.warn(string, Object.keys(options.chunked_rows), options.found_backward, options.found_forward)

    // found anything ?
    if (options.found_backward.length || options.found_forward.length) {
      // combine chunked lists into nice output dict
      for (let word of options.found_backward) {
        let row: any = await str_row(word, options.str_row_options)
        if (row && row.list_count) {
          ch1_keys.push(row.key)
          ch1_rows[word] = row
          ch1_score += Math.max(row.list_count, 75)
          let len = word.length
          if (len < ch1_shortest) {
            ch1_shortest = len
          }
        }
      }
      for (let word of options.found_forward) {
        let row: any = await str_row(word, options.str_row_options)
        if (row && row.list_count) {
          ch1_rows[word] = row
          ch1_keys.push(row.key)
          ch1_score += Math.max(row.list_count, 75)
          let len = word.length
          if (len < ch1_shortest) {
            ch1_shortest = len
          }
        }
      }
      ch1_str = ch1_keys.join(" ").trim()
      if (DEBUG0) global.cconsole.warn(`                   ch1_str "${ch1_str}"`)

      // string corrupted ?
      if (
        ch1_str.includes(" ") &&
        ch1_str.replace(/[^\d\w]+/g, "").toLowerCase() !== string.replace(/[^\d\w]+/g, "").toLowerCase()
      ) {
        ch1_str_changed = true
      }
    }
    ch1_score -= (string.length - ch1_str.length) * 50
    let ch1_forward_key = options.str_forward
    let ch1_backward_key = options.str_backward
    if (DEBUG1) global.cconsole.debug(`after 1st try ((${ch1_score}))`, ch1_keys)
    if (DEBUG1) global.cconsole.debug(`str_forward="${ch1_forward_key}"`)
    if (DEBUG1) global.cconsole.debug(`str_backward="${ch1_backward_key}"`)

    /*
     * 2ND TRY
     */
    let ch2_rows: any = {}
    let ch2_score = 0
    let ch2_keys = []
    let ch2_str = ""
    let ch2_shortest = string.length
    let ch2_string_changed = false
    // if (
    //   ch1_str_changed ||
    //   ch1_score < 100 ||
    //   (options.str_backward && options.str_backward[options.str_backward.length - 1] === "s")
    // ) {
    // reset
    options = {
      ...options,
      str_forward: "",
      str_backward: "",
      remainder_backward: "",
      chunked_rows: {},
      found_backward: [],
      found_forward: [],
      try_without_s: true
    }

    // chunk
    await chunk_word_backward(string, options)
    if (DEBUG1)
      global.cconsole.warn(string, Object.keys(options.chunked_rows), options.found_backward, options.found_forward)

    // found anything ?
    // if (options.found_backward.length || options.found_forward.length) {
    // combine chunked lists into nice output dict
    for (let word of options.found_backward) {
      let row: any = await str_row(word, options.str_row_options)
      if (row && row.list_count) {
        ch2_keys.push(row.key)
        ch2_rows[word] = row
        ch2_score += Math.max(row.list_count, 75)
        let len = word.length
        if (len < ch2_shortest) {
          ch2_shortest = len
        }
      }
    }
    for (let word of options.found_forward) {
      let row: any = await str_row(word, options.str_row_options)
      if (row && row.list_count) {
        ch2_rows[word] = row
        ch2_keys.push(row.key)
        ch2_score += Math.max(row.list_count, 75)
        let len = word.length
        if (len < ch2_shortest) {
          ch2_shortest = len
        }
      }
    }
    ch2_str = ch2_keys.join(" ").trim()
    if (DEBUG0) global.cconsole.warn(`                   ch2_str "${ch2_str}"`)

    // string corrupted !!!???
    if (
      ch2_str.includes(" ") &&
      ch2_str.replace(/[^\d\w]+/g, "").toLowerCase() !== string.replace(/[^\d\w]+/g, "").toLowerCase()
    ) {
      ch2_string_changed = true
    }
    ch2_score -= (string.length - ch2_str.length) * 50
    let ch2_forward_key = options.str_forward
    let ch2_backward_key = options.str_backward
    if (DEBUG1) global.cconsole.debug(`after 2nd try ((${ch2_score}))`, ch2_keys)
    if (DEBUG1) global.cconsole.debug(`str_forward="${ch2_forward_key}"`)
    if (DEBUG1) global.cconsole.debug(`str_backward="${ch2_backward_key}"`)
    // }

    /*
     * COMPARE 1ST AND 2ND
     * if both 1 and 2 are corrupted...
     * output the best phrase
     */
    if (!ch1_str_changed && ch2_string_changed) {
      /*
       * use #2
       */
      if (DEBUG1) global.cconsole.log("!ch1_str_changed && ch2_string_changed", Object.keys(ch1_rows))
      return { chunked_string: ch1_str, chunked_rows: ch1_rows }
    } else if (ch1_str_changed && !ch2_string_changed) {
      /*
       * use #2
       */
      if (DEBUG1) global.cconsole.log("ch1_str_changed && !ch2_string_changed", Object.keys(ch2_rows))
      return { chunked_string: ch2_str, chunked_rows: ch2_rows }
    } else if (!ch1_str_changed && !ch2_string_changed) {
      /*
       * both good, which has higher score?
       */
      if (ch1_score > ch2_score) {
        // choose 1st
        if (DEBUG1) global.cconsole.log("ch1_score > ch2_score", Object.keys(ch1_rows))
        return { chunked_string: ch1_str, chunked_rows: ch1_rows }
      } else {
        // choose 2nd
        if (DEBUG1) global.cconsole.log("ch1_score <= ch2_score", Object.keys(ch2_rows))
        return { chunked_string: ch2_str, chunked_rows: ch2_rows }
      }
    } else {
      /*
       * neither one good... save for later, in case next step doesn't work
       */
      if (DEBUG1) global.cconsole.error("possibly_corrupted_output", Object.keys(ch2_rows))
      return { chunked_string: "", chunked_rows: {} }
    }

    /*
     * If PROBABLY CORRUPTED,
     * then don't use so many words
     */
    // final list
    // let final_keys = []
    // let key_last = ""
    // let key_first = ""
    // let key_middle = ""
    // let row_last = null
    // let row_first = null
    // let row_middle = null
    // //
    // // found anything backward?
    // if (options.str_backward) {
    //   if (DEBUG1) global.cconsole.log(`found str_backward "${options.str_backward}"`)
    //   let row = options.checked_strings[options.str_backward]
    //   if (row && row.list_count > MINSYN * 2) {
    //     // first found
    //     key_first = options.str_backward
    //     row_first = row
    //   }
    // }
    // // found anything forward ?
    // if (options.str_forward) {
    //   if (DEBUG1) global.cconsole.log(`found str_forward "${options.str_forward}"`)
    //   let row = options.checked_strings[options.str_forward]
    //   if (row && row.list_count > MINSYN * 2) {
    //     // first found
    //     key_last = options.str_forward
    //     row_last = row
    //   }
    // }
    // // what remains?
    // if (options.remainder_forward && options.str_backward) {
    //   if (DEBUG1)
    //     global.cconsole.log(
    //       `of remainder_forward "${options.remainder_forward}", remove str_backward "${options.str_backward}"`
    //     )
    //   key_middle = options.remainder_forward.replace(options.str_backward, "")
    // } else if (options.remainder_backward && options.str_forward) {
    //   if (DEBUG1)
    //     global.cconsole.log(`of remainder_backward "${options.remainder_backward}" str_forward "${options.str_forward}"`)
    //   key_middle = options.remainder_backward.replace(options.str_forward, "")
    // }
    // if (key_middle) {
    //   let row = options.checked_strings[key_middle] || (await str_row(key_middle, { REBUILD: false, model: false }))
    //   if (row && row.list_count > MINSYN * 2) {
    //     row_middle = row
    //   }
    // }
    // if (DEBUG1) global.cconsole.log([key_first, key_middle, key_last])
    // if (DEBUG1) console.log([(row_first || {}).list_count, (row_middle || {}).list_count, (row_last || {}).list_count])
    //
    // //
    // // put it together
    // if (row_first && row_last) {
    //   if (row_middle) {
    //     final_keys = [key_first, key_middle, key_last]
    //   } else if (row_first && row_last) {
    //     if (row_first.list_count > row_last.list_count) {
    //       final_keys = [key_first, key_middle + key_last]
    //     } else {
    //       final_keys = [key_first + key_middle, key_last]
    //     }
    //   } else if (row_first) {
    //     final_keys = [key_first, key_middle + key_last]
    //   } else if (row_last) {
    //     final_keys = [key_first + key_middle, key_last]
    //   } else {
    //     // can't parse!!!
    //     global.cconsole.error(`cant parse: "${string}", 2nd if else`)
    //   }
    // } else if (row_first && !row_last) {
    //   final_keys = [key_first, key_middle + key_last]
    // } else if (row_last && !row_first) {
    //   final_keys = [key_first + key_middle, key_last]
    // } else {
    //   // can't parse!!!
    //   global.cconsole.error(`cant parse: "${string}", 1st if else`)
    // }
    //
    // // global.cconsole.log("final_keys", final_keys)
    // //
    // // build string/dict
    // let final_string = final_keys.join(" ")
    // let final_rows: any = {}
    // for (let key of final_keys) {
    //   final_rows[key] = await str_row(key)
    // }
    //
    // //
    // // check validity
    // if (final_string.replace(/[^\d\w]+/g, "").toLowerCase() === string.replace(/[^\d\w]+/g, "").toLowerCase()) {
    //   api_options.string_changed = false
    // }
    // //
    // // return
    // return { chunked_string: final_s, chunked_rows: final_rowstring }
  } catch (e) {
    global.cconsole.error("chunk_word error: " + e.toString())
  }
}
export default thisModule
