import { sort_strings_by_length } from "pauls-pure-functions/functions/sort_words"
import { sleep } from "pauls-pure-functions/functions/promises"
import { anonFunction } from "pauls-pure-functions/functions/functions"
import "dotenv/config" // contains secret keys ~ never push to GIT!
import "common/global.js" // contains secret keys ~ never push to GIT!
import { data_word_get_parsed, data_word_put } from "@api/data.words/pgdb"
import key_row from "@api/data.words/promise/key"
import abbreviations from "@techytools/constants/data/words/samisaurus/abbr"
global.exit = function () {
  process.exit()
}
global.kill = function () {
  global.execute("kill " + process.pid)
}

/*
 * Ingest new abbreviations, without messing up existing database content:
 * Each new abbreviation entry is a tuple:
 * arr[0] = string of abbreviations, comma separated
 * arr[1] = string of words which describe these abbreviations, comma separated
 * ["tbs, tbsp, t", "tablespoon,tablespoons"],
 */
let DEBUG1 = false
let DEBUG2 = false
anonFunction(async () => {
  await sleep(1000)
  for (let tuple of abbreviations) {
    if (DEBUG1) global.cconsole.log("tuple", tuple)
    /*
     * Read each note (tuple), and parse abbreviations and synonyms
     */
    if (!tuple[0] || !tuple[1]) continue
    let abbrs = tuple[0].split(",").map(w => w.trim()).filter(w => !!w) // prettier-ignore
    let words = tuple[1].split(",").map(w => w.trim()).filter(w => !!w) // prettier-ignore
    if (!abbrs.length || !words.length) continue
    if (DEBUG1) global.cconsole.log("abbrs", abbrs)
    if (DEBUG1) global.cconsole.log("words", words)

    /*
     *
     * Add abbreviations to word
     *
     */
    let words_rows = []
    for (let word of words) {
      // row
      let row: any = await key_row(word)
      global.cconsole.success("got row from key_row()", row ? row.key : row)
      words_rows.push(row)
      // fix
      row.abbreviation = (row.abbreviation || "").toLowerCase()
      // replace
      if (
        !row.abbreviation ||
        row.abbreviation === (row.key || "").toLowerCase() ||
        row.abbreviation === (row.acronym || "").toLowerCase() ||
        row.abbreviation === (row.root || "").toLowerCase() ||
        row.abbreviation === (row.singular || "").toLowerCase() ||
        row.abbreviation === (row.plural || "").toLowerCase()
      ) {
        row.abbreviation = abbrs.join(",")
      }
      // append
      else {
        let abbrs_strs = row.abbreviation.split(",")
        let abbrs_set = new Set()
        // add old ones
        for (let str of abbrs_strs) {
          str = str.trim()
          if (!str) continue
          abbrs_set.add(str)
        }
        // add new ones
        for (let str of abbrs) {
          abbrs_set.add(str)
        }
        // save
        row.abbreviation = [...abbrs_set].join(",")
      }
      // fix abbreviations
      let uabbrs: any = {}
      for (let str of row.abbreviation
        .split(",")
        .map((str) => str.trim())
        .filter((str) => !!str)) {
        uabbrs[str.toLowerCase()] = str
      }
      let uabbrs_list = Object.values(uabbrs).filter((str) => !!str)
      row.abbreviation = uabbrs_list.join(",")
      // save
      if (DEBUG1) global.cconsole.info(`adding abbreviations "${row.abbreviation}" to word "${row.key}"`)
      await data_word_put(row)
    }

    /*
     *
     * Add word to abbreviation
     *
     */
    /*
     * which words to add?
     */
    let words_to_add_to_abbrs = [...words_rows, ...abbrs]
    // if it's a phrase, break down to each individual word
    for (let phrase of words) {
      let strs = phrase.split(" ")
      if (strs.length > 1) {
        strs = sort_strings_by_length(strs, true)
        let added_n = 0
        for (let str of strs) {
          if (!str) continue
          // add word (string)
          words_to_add_to_abbrs.push(str)
          // add 3 words only
          added_n++
          if (added_n >= 3) break
        }
      }
    }
    /*
     * add them to each abbr
     */
    for (let abbr of abbrs) {
      // get row (or make if does not exist)
      // add words
      let row: any = await key_row(abbr, { synonyms: words_to_add_to_abbrs })
      // save row
      if (DEBUG1) {
        global.cconsole.info(`adding words "${words_to_add_to_abbrs.map((row) => row.key)}" to abbreviation "${abbr}"`)
      }
      await data_word_put(row)
    }
  }

  /*
   *
   * Done
   *
   */
  // global.execute("kill " + process.pid)
  // process.exit()
})
