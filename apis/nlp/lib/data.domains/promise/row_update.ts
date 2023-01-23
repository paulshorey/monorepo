/*
 * Dependencies
 */
import { data_word_get_parsed } from "@ps/nlp/lib/pgdb/word"
import { data_domain_get_parsed, data_domain_put } from "@ps/nlp/lib/pgdb/domain"
import domain_syns_of_syns from "./key_syns_of_syns"

/**
 * Recall domain DB row - modify keys
 * @params {object} row - DB row {key, syns1, etc}
 * @resolves {object} row - edited DB row - add syns2, syns3
 */
export default function (inputRow) {
  return new Promise(async (resolve, reject) => {
    /*
     * Validate
     */
    if (!inputRow || !inputRow.key) {
      reject("!inputRow.key")
    }

    /*
     * Update DB row - from user inputRow
     * if inputRow is not just {key:'xxx'},
     * but includes some other property (>1)
     */
    if (Object.keys(inputRow).length > 1) {
      await data_domain_put(inputRow)
    }

    /*
     * Get row - from DB
     */
    let row: any = await data_domain_get_parsed(inputRow.key)

    /*
     * Rebuild syns123
     */
    row.syns1 = []
    row.syns2 = []
    row.syns3 = []
    let syns_of_syns: any = await domain_syns_of_syns(inputRow.key)
    for (let syn1 in syns_of_syns) {
      // add to row.syns1
      row.syns1.push(syn1)
      // parse 2/3
      let syns23 = syns_of_syns[syn1]
      for (let syn of syns23) {
        if (syn.substring(0, 2) === "__") {
          // add to row.syns3 (if starts with __)
          row.syns3.push(syn.substr(2))
        } else {
          // add to row.syns2
          row.syns2.push(syn)
        }
      }
    }

    /*
     * Save row
     */

    await data_domain_put(row)
    resolve(row)
  })
}

/**
 * HELPER:
 * Add derivations/synonyms to array
 * @param {array} list - original array to add to - will add new derivations/synonyms to this array
 * @param {string} key - get word DB row with this keyword, will add root/singular/synonyms/etc of from that DB row
 * @param {number} limit - max number of synonyms and derivations to add
 * @param {boolean} use_full_list - if true, will use row.list. If false (default), will use row.ok_list (no negative sentiments).
 * @returns Promise<{array}> list - modified param list
 */
async function add_to_list(list, key, limit = 3, use_full_list = false) {
  let which_list = use_full_list ? "list" : "ok_list"
  /*
   * List of all new words which will be added to list
   */
  let addlist = [key]
  /*
   * Get synonyms/derivations of key
   */
  let row: any = await data_word_get_parsed(key, "root,singular,plural,acronym,abbreviation,derivations," + which_list)
  if (row && row.list_count && row[which_list] && row[which_list].length) {
    if (key.length <= 3) {
      //
      // if word too short,
      // ignore derivations
      row.derivations = []
    } else {
      //
      // if word length ok,
      // fix derivations
      if (!row.derivations) {
        row.derivations = []
      }
      if (typeof row.derivations === "string") {
        row.derivations = row.derivations.split(",").filter((w) => w.trim())
      }
    }
    // add derivations and synonyms
    for (let w of [
      row.root,
      row.singular,
      row.plural,
      row.acronym,
      row.abbreviation,
      ...row.derivations.slice(0, limit),
      ...row[which_list].slice(0, limit)
    ]) {
      if (w && !w.includes(" ")) {
        addlist.push(w)
      }
    }
  }
  /*
   * Add to list
   */
  list = [...list, ...addlist]
  return list
}
