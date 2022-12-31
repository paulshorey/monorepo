import str_row from "@ps/nlp/lib/words/promise/str_row"

/**
 * Break string into words (check rows from DB for every character)
 * @params {chunks} - dictionary of already found chunks (DB rows), by key
 * @params {string} - string to break
 * @returns {undefined} - instead, aggregates newly found chunks into chunks input parameter
 */
let DEBUG1 = false
let DEBUG2 = false

const chunk_word_backward = async function (string, options: any = {}) {
  if (DEBUG2) global.cconsole.log('chunk backward "' + string + '"')
  /*
   * validate & filter
   */
  // set default options:
  let MINLEN = 2 // min input string length (reject with empty response if less)
  // options:
  let { found_backward = [], chunked_rows = {}, checked_strings = {} } = options
  string = string.trim()
  if (!string) return
  // ok to chunk single letter word
  if (string[0] === "i" || string[0] === "a") {
    MINLEN = 1
  }
  // if less than N characters, no need to break, is probably an acronym
  if (string.length < MINLEN) return

  // search backwards
  // i_from = always starting at zero
  // i_to = first, end at last letter; then, end at 3rd letter
  if (DEBUG1) global.cconsole.info("chunk_word_backward()", string)
  let i_to_not_greedy = string.length + 1
  let i_from = 0
  for (let i_to = string.length; i_to >= MINLEN; i_to--) {
    // search from to
    let str = string.substring(i_from, i_to)
    if (!str) continue
    let row = checked_strings[str] || (await str_row(str, options.str_row_options))
    if (DEBUG2) global.cconsole.log(str, row ? row.list_count : "row is undefined")
    // not real word?
    if (!row || !row.list_count) continue
    // {
    //   if (str[str.length - 1] === "s") {
    //     str = str.substr(0, str.length - 1)
    //     row = checked_strings[str] || (await str_row(str, options.str_row_options))
    //   }
    //   if (!row || !row.list_count) {
    //     continue
    //   }
    // }
    if ((row.aux && row.list_count < options.MINSYN) || (!row.aux && row.list_count < options.MINSYN)) {
      // forgive propers - may have ended up in stopwords and have less than MINSYN
      if (!row.proper) continue
    }
    /*
     * found chunk
     */
    checked_strings[str] = row
    if (DEBUG2) global.cconsole.success("found chunk row", str, row.list_count, row.pos1, row.aux)

    /*
     * go one more, see if we can find an even better word
     */
    // if (
    //   row.pos1 === "etc" ||
    //   (row.list_count < 100 && str[str.length - 1] === "s") ||
    //   (row.list_count < 100 && i_to !== i_to_not_greedy)
    //   // && str[str.length - 1] !== "s" ???
    // ) {
    //   // if word is good, then be very strict!
    //   let be_picky = row.list_count > options.MINSYN * 4
    //   let be_very_picky = !options.try_without_s && (str[str.length - 1] === "s" || row.singular)
    //   // if NOT stopword, then try to parse -1
    //   if (DEBUG1)
    //     global.cconsole.warn(`found "${row.key}"... now check -1`, row.aux, row.pos1, row.list_count, row.pos1, row.aux)
    //   if (!row.aux && !["det", "pre", "con", "pro"].includes(row.pos)) {
    //     // next loop, skip this check
    //     i_to_not_greedy = i_to - 1
    //     let str2 = str.substring(0, str.length - 1)
    //     check_row2: if (str2.length >= MINLEN) {
    //       let row2 = !!str2 ? checked_strings[str2] || (await str_row(str2, options.str_row_options)) : null
    //       // not real word?
    //       if (
    //         !row2 ||
    //         !row2.list_count ||
    //         (row2.aux && row2.list_count < options.MINSYN) ||
    //         (!row2.aux && row2.list_count < options.MINSYN)
    //       ) {
    //         break check_row2
    //       }
    //       if (row2 && row2.list_count >= options.MINSYN) {
    //         if (DEBUG1) global.cconsole.warn(`found -1 "${str2}"`, row2.list_count)
    //         // ok, found another viable word...
    //         // compare it to the original string we found, see which is better...
    //         let row2_is_better = false
    //         if (be_very_picky && row2.list_count > row.list_count * 2) {
    //           row2_is_better = true
    //         } else if (be_picky && row2.list_count > row.list_count * 1.5) {
    //           row2_is_better = true
    //         } else if (row2.list_count > row.list_count) {
    //           row2_is_better = true
    //         }
    //         if (row2_is_better) {
    //           // 2nd one is better! continue! will add it next loop
    //           if (DEBUG2) global.cconsole.warn(`str2="${row2.key}" pos="${row2.pos1}" count="${row2.list_count}"`)
    //           if (DEBUG2) global.cconsole.warn(`is better than str="${row.key}" pos="${row.pos1}" count="${row.list_count}"`)
    //           continue
    //         }
    //       }
    //     }
    //   }
    // }

    /*
     * add found chunk
     */
    found_backward.push(str)
    chunked_rows[str] = row

    /*
     * chunk the remainder
     */
    // if remainder is a real word, great!
    // if recursive, keep searching...
    // if not recursive, then stop here
    let str_remainder = string.substring(i_to, string.length).trim()
    if (!options.str_backward) {
      options.str_backward = str
      options.remainder_backward = str_remainder
    }
    if (str_remainder) {
      let row_remainder = checked_strings[str_remainder] || (await str_row(str_remainder, options.str_row_options))
      if (row_remainder && row_remainder.list_count >= options.MINSYN) {
        if (DEBUG2) global.cconsole.warn("remainder chunk row", str_remainder, row_remainder.list_count)

        /*
         * add found chunk (entire remainder)
         */
        found_backward.push(str_remainder)
        chunked_rows[str_remainder] = row_remainder
      } else {
        /*
         * chunk the remainder
         */
        if (options.recursive) {
          await chunk_word_backward(str_remainder, options)
        }
      }
    }
    break
  }
}
export default chunk_word_backward
