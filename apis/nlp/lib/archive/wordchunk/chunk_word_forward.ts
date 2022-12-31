import str_row from "@ps/nlp/lib/words/promise/str_row"

/**
 * Break string into words (check rows from DB for every character)
 *    NOTE: when going forward, found words are prepended to the beginning of the list
 * @params {chunks} - dictionary of already found chunks (DB rows), by key
 * @params {string} - string to break
 * @returns {undefined} - instead, aggregates newly found chunks into chunks input parameter
 */
let DEBUG1 = false
let DEBUG2 = false

const chunk_word_forward = async function (string, options: any = {}) {
  if (DEBUG2) global.cconsole.log('chunk forward "' + string + '"')
  /*
   * validate & filter
   */
  // set default options:
  let MINLEN = 2 //  min extracted word length (ignore word if less)
  // options:
  let { found_forward = [], chunked_rows = {}, checked_strings = {} } = options
  string = string.trim()
  if (!string) return
  // ok to chunk single letter word
  if (string[string.length - 1] === "i" || string[string.length - 1] === "a") {
    MINLEN = 1
  }
  // if less than N characters, no need to break (min word length is n characters)
  if (string.length < MINLEN) return

  /*
   * chunk string
   */
  if (DEBUG1) global.cconsole.info("chunk_word_forward()", string)
  let i_from_not_greedy = -1
  let i_to = string.length // search until the end of str
  for (let i_from = 0; i_from <= i_to - MINLEN; i_from++) {
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
      // forgive propers - may have ended up in stopwords and have less than options.MINSYN
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
    //   (row.list_count < options.MINSYN * 2 && i_from !== i_from_not_greedy && !row.proper && !row.acronym && !row.aux)
    // ) {
    //   // if NOT stopword, then try to parse -1
    //   if (DEBUG1)
    //     global.cconsole.warn(`found "${row.key}"... now check -1`, row.aux, row.pos1, row.list_count, row.pos1, row.aux)
    //   // next loop, skip this check
    //   i_from_not_greedy = i_from + 1
    //   let str2 = str.substring(1, str.length)
    //   check_row2: if (str2.length >= MINLEN) {
    //     let row2 = !!str2 ? checked_strings[str2] || (await str_row(str2, options.str_row_options)) : null
    //     // not real word?
    //     if (
    //       !row2 ||
    //       !row2.list_count ||
    //       (row2.aux && row2.list_count < options.MINSYN) ||
    //       (!row2.aux && row2.list_count < options.MINSYN)
    //     ) {
    //       break check_row2
    //     }
    //     if (row2 && row2.list_count >= options.MINSYN) {
    //       if (DEBUG1) global.cconsole.warn(`found -1 "${str2}"`, row2.list_count)
    //       // ok, found another viable word...
    //       // compare it to the original string we found, see which is better...
    //       if (row2.list_count >= row.list_count) {
    //         // 2nd one is better! continue! will add it next loop
    //         if (DEBUG2) global.cconsole.warn(`str2="${row2.key}" pos="${row2.pos}" count="${row2.list_count}"`)
    //         if (DEBUG2) global.cconsole.warn(`is better than str="${row.key}" pos="${row.pos}" count="${row.list_count}"`)
    //         continue
    //       }
    //     }
    //   }
    // }

    /*
     * add found chunk
     */
    found_forward.unshift(str)
    chunked_rows[str] = row

    /*
     * chunk the remainder
     */
    // if remainder is a real word, great!
    // if recursive, keep searching...
    // if not recursive, then stop here
    let str_remainder = string.substring(0, i_from)
    if (!options.str_forward) {
      options.str_forward = str
      options.remainder_forward = str_remainder
    }
    if (str_remainder) {
      let row_remainder = checked_strings[str_remainder] || (await str_row(str_remainder, options.str_row_options))
      if (row_remainder && row_remainder.list_count >= options.MINSYN) {
        if (DEBUG2) global.cconsole.warn("remainder chunk row", str_remainder, row_remainder.list_count)

        /*
         * add found chunk (entire remainder)
         */
        found_forward.unshift(str_remainder)
        chunked_rows[str_remainder] = row_remainder
      } else {
        /*
         * chunk the remainder
         */
        if (options.recursive) {
          await chunk_word_forward(str_remainder, options)
        }
      }
    }
    break
  }
}
export default chunk_word_forward
