/*
 * Dependencies
 */
import dict_info from "../function/dict_info"
import row_model from "../function/row_model"
import row_meta from "../function/row_meta"
import row_fw from "../function/row_fw"
import row_tlds from "./row_tlds"
import row_poss from "./row_poss"
import row_pos_short from "../function/row_pos_short"
import row_food from "../function/row_food"
import { data_word_get_parsed } from "../../pgdb/data.words"
import { performance } from "perf_hooks"

/**
 * Get DB row, add domains
 * @params key {string} - keyword string
 * @params options {object}
 * @params options.model {boolean} - flag,
 *    true = ignore database row, return empty default model
 *    false = ignore empty default model, return undefined if row not found in database
 *    undefined = return row from database if exists, or default empty model object
 * @resolves {object} row - DB row {key, pos1, root, etc}
 */
const thisModule = async function (str, options: any = {}): Promise<any> {
  let DEBUG_TIME = false
  let debug_time_since
  let debug_time = function (message) {
    let time = performance.now()
    if (debug_time_since && message) {
      global.cconsole.log(`DEBUG_TIME ${message} = `, Math.round((time - debug_time_since) / 10) / 100)
    }
    debug_time_since = time
  }
  return new Promise(async (resolve) => {
    if (!str) {
      throw new Error("!str")
    }
    /*
     * options
     */
    let DEBUG1 = false // debug variables
    let DEBUG2 = false // debug errors
    let REBUILD = false
    let REBUILD_TLDS = false // always default false!
    let REBUILD_LIST_COUNT = false // always default false!
    // options.model = false;
    if ("REBUILD" in options) {
      switch (options.REBUILD) {
        case "tlds":
          REBUILD_TLDS = true
          REBUILD = false
          break
        case "list_count":
          REBUILD_LIST_COUNT = true
          REBUILD_TLDS = false
          REBUILD = false
          break
        case true:
          REBUILD = true
          break
        case false:
          REBUILD = false
          break
      }
    }
    /*
     * debug time
     */
    if (DEBUG_TIME) debug_time(" " + str)
    if (DEBUG1 && REBUILD) {
      global.cconsole.info("str_row", str, options)
    }
    /*
     * initial values
     */
    let row: any = { key: str }
    let key = (row.key = str
      .replace(/[^\w\d\-]+/g, "")
      .toLowerCase()
      .trim())
    /*
     *
     * get row from DB
     *
     */
    let dbrow: any = await data_word_get_parsed(row.key)
    if (dbrow) {
      /*
       * FOUND
       */
      if (DEBUG1) global.cconsole.success(`found row "${row.key}"`)
      row = dbrow
    } else {
      /*
       * NOT FOUND
       */
      if (DEBUG1) global.cconsole.warn(`!row "${row.key}"`)
      if (options.model === false) {
        /*
         * Return nothing if specified, though by default would continue with empty row
         */
        if (DEBUG1) global.cconsole.log(`resolve empty object, because !row and options.model===false "${row.key}"`)
        resolve({})
        return
      } else {
        /*
         * Continue with empty default row
         */
        if (DEBUG1) global.cconsole.log(`resolve default row for "${row.key}"`)
        row = row_model(row)
        row_meta(row)
        resolve(row)
        return
      }
    }

    /*
     *
     * REBUILD
     *
     */
    if (REBUILD) {
      if (DEBUG2 && !options.synonyms) global.cconsole.warn(`rebuild row "${key}"`)
      if (DEBUG1 && options.synonyms) global.cconsole.success("options.synonyms = ", options.synonyms)
      // time
      if (DEBUG_TIME) debug_time("rebuild start " + str)
      /*
       * add derivations row.dict
       */
      let add_dict: any = {}
      // acronyms
      if (row.acronym) {
        for (let word of row.acronym.split(",")) {
          word = word.trim()
          if (row.dict[word]) continue
          // add to dict
          let wrow = row_model({ key: word, pos1: row.pos1 })
          row.dict[word] = dict_info(wrow, "", false)
        }
      }
      // abbreviations
      if (row.abbreviation) {
        for (let word of row.abbreviation.split(",")) {
          word = word.trim()
          if (row.dict[word]) continue
          // add to dict
          let wrow = row_model({ key: word, pos1: row.pos1 })
          row.dict[word] = dict_info(wrow, "", false)
        }
      }
      // synonyms
      if (options.synonyms) {
        for (let syn of options.synonyms) {
          if (row.dict[syn]) continue
          // synonym - if string, then find DB row object
          let wrow = syn.key ? syn : await thisModule(syn, { REBUILD: false, REBUILD_TLDS: false })
          // add to dict
          row.dict[syn] = dict_info(wrow, "", false)
        }
        if (DEBUG1) global.cconsole.success("added synonyms", add_dict)
      }
      // time
      if (DEBUG_TIME) debug_time("rebuilt added derivations to row.dict " + str)

      /*
       * Compile data object
       */
      if (DEBUG2) global.cconsole.warn("rebuilding row data object... (tlds, meta, pos_short, poss)")

      row_pos_short(row, { DEBUG1: !!options.synonyms })
      if (DEBUG_TIME) debug_time("rebuilt pos_short " + str)

      await row_poss(row, options)
      if (DEBUG_TIME) debug_time("rebuilt poss " + str)

      row_meta(row) // modifies .poss if .proper
      if (DEBUG_TIME) debug_time("rebuilt meta " + str)

      await row_tlds(row)
      if (DEBUG_TIME) debug_time("rebuilt tlds " + str)

      row_food(row) // requires updated .tlds
      row_fw(row) // modifies .poss
      if (DEBUG_TIME) debug_time("rebuilt food/fw " + str)
    }

    /*
     *
     * NOT FULL REBUILD, ONLY UPDATE TLDS
     *
     */
    if (REBUILD_TLDS) {
      if (DEBUG_TIME) debug_time("rebuild tlds only start " + str)
      if (DEBUG2) global.cconsole.warn("rebuilding row data object... (tlds only)")
      row = await row_tlds(row)
      if (DEBUG2) global.cconsole.warn("after row_tlds")
      if (DEBUG_TIME) debug_time("rebuilt tlds " + str)
    }

    /*
     *
     * NOT FULL REBUILD, ONLY UPDATE list_count
     *
     */
    if (REBUILD_LIST_COUNT) {
      if (DEBUG_TIME) debug_time("rebuild list_count only start " + str)
      if (DEBUG2) global.cconsole.warn("rebuilding row data object... (list_count/meta/stopwords only)")
      // stopword ? name ? brand
      row_meta(row)
      if (DEBUG2) global.cconsole.warn("after row_tlds")
      if (DEBUG_TIME) debug_time("rebuilt list_count/meta " + str)
    }
    /*
     *
     * Resolve
     *
     */
    if (DEBUG2) global.cconsole.log("resolve " + typeof row)
    resolve(row)
  })
}
export default thisModule
