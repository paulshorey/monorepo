// import { sleep } from 'pauls-pure-functions/functions/promises.js';
import "../../global.js" // contains secret keys ~ never push to GIT!
import { data_get_words, data_word_put } from "@ps/nlp/api/data.words/pgdb"
import consolee from "cconsole"
import key_row from "@ps/nlp/api/data.words/promise/key"

/*
 *
 * GET FIRST SET OF ROWS:
 *
 */
;(async function () {
  /*
   * Rows
   * Update all vrsn=13,14,15 to vrsn=20 (success)
   * vrsn 11,12 should be re-run
   */
  const rows = await await data_get_words(
    `(vrsn < 21) AND (list_count IS NOT NULL AND list_count>=1) AND ((singular IS NOT NULL AND singular!='') OR (singular IS NOT NULL AND singular!='')) LIMIT 1000`,
    "key,singular,plural"
  ) // vrsn < 6000 AND

  /*
   * Validate rows
   */
  if (!rows || !rows.length) {
    console.error(!rows ? "!rows" : "!rows.length")
    global.execute("pm2 stop all")
    throw new Error(!rows ? "!rows" : "!rows.length")
  }

  /*
   * Each row
   */
  for (let row of rows) {
    /*
     * Validate row
     */
    if (!row || !row.key) {
      console.error(!row ? "!row" : "!row.key")
      global.execute("pm2 stop all")
      throw new Error(!row ? "!row" : "!row.key")
    }

    /*
     * Save to DB (failsafe, new version)
     */
    row.vrsn = 21
    row.timestamp = Date.now()
    await data_word_put(row)

    /*
     * Edit row
     */
    // same as key
    if (row.singular === row.key) {
      row.singular = ""
    }
    if (row.plural === row.key) {
      row.plural = ""
    }
    // length
    if (row.singular) {
      if (row.singular.length > row.key.length + 1) {
        row.singular = ""
      }
    }
    if (row.plural) {
      if (row.plural.length < row.key.length - 1) {
        row.plural = ""
      }
    }
    // fix if ends in "ss"
    if (row.key.substr(-2) === "ss") {
      row.singular = ""
    }
    if (row.plural.substr(-2) === "ss") {
      row.plural = ""
    }
    // cleanup
    if (row.plural === row.singular || row.plural === row.key) {
      row.plural = ""
    }
    if (row.singular === row.plural || row.singular === row.key) {
      row.singular = ""
    }

    /*
     * Save to DB (changes)
     */
    row.vrsn = 22
    row.timestamp = Date.now()
    await data_word_put(row)

    /*
     * LOG
     */
    // consolee.log('edited row "' + row.key + '"', [row.root, row.singular, row.plural])

    // break
  }

  process.exit()
})()
