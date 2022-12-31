// import { sleep } from 'pauls-pure-functions/functions/promises.js';
import "dotenv/config" // contains secret keys ~ never push to GIT!
import "common/global.js" // contains secret keys ~ never push to GIT!
import { data_get_words, data_word_put } from "@api/data.words/pgdb"
import str_row from "@api/data.words/promise/str_row"

/*
 *
 * GET FIRST SET OF ROWS:
 *
 */
let DEBUG1 = false
const okgo = async function () {
  /*
   * Which rows to use
   */
  const rows = await data_get_words(
    `vrsn <= 200 AND vrsn IS NOT NULL AND list_count>=10 AND char_count>=3 AND ((abbreviation IS NOT NULL AND abbreviation!='') OR (acronym IS NOT NULL AND acronym!='')) ORDER BY list_count DESC, timestamp DESC`,
    "key, acronym, abbreviation, list_count",
    500
  )

  /*
   * Validate words
   */
  if (!rows || !rows.length) {
    console.error(!rows ? "!rows" : "!rows.length")
    global.execute("pm2 stop all")
    process.exit()
    throw new Error(!rows ? "!rows" : "!rows.length")
  }

  /*
   * Each row
   */
  for (let row of rows) {
    try {
      /*
       * Validate row
       */
      if (!row || !row.key) {
        console.error(!row ? "!row" : "!row.key")
        global.execute("pm2 stop all")
        process.exit()
        throw new Error(!row ? "!row" : "!row.key")
      }

      /*
       * Debug
       */
      if (DEBUG1) global.cconsole.info(`editing row`, row)

      /*
       * Rebuild row
       */
      // row = await str_row(row.key, { "REBUILD": true })
      row.vrsn = 200
      row.timestamp = Date.now()
      await data_word_put(row)

      /*
       * For each abbreviation, modify the abbreviated row
       */
      let full_version = row.key
      for (let key of row.abbreviation.split(",")) {
        key = key.trim().toLowerCase()
        if (!key || key.length === 1 || key.length >= full_version.length) continue

        /*
         * Get/Edit row
         */
        let row2: any = await str_row(key, { REBUILD: true })
        if (!row2) {
          if (DEBUG1) global.cconsole.error("!row2")
          continue
        }

        /*
         * Add full-version
         */
        if (row2.abbreviation) {
          row2.abbreviation += "," + full_version
        } else {
          row2.abbreviation = full_version
        }
        // read array of abbreviations
        // first trim() so map has something to work with
        // second trim() to remove any that were empty spaces
        let arr = row2.abbreviation
          .split(",")
          .filter((str) => !!str)
          .map((str) => str.trim())
          .filter((str) => !!str)
        // as long as ${arr} is an Array, slice() and join() will function as intended,
        // even if array has zero or one items
        row2.abbreviation = [...new Set(arr)].slice(0, 4).join(",")

        /*
         * Save to DB (changes)
         */
        row2.vrsn = 210
        row2.timestamp = Date.now()
        await data_word_put(row2)

        /*
         * LOG
         */
        if (DEBUG1) global.cconsole.log({ key: row2.key, abbreviation: row2.abbreviation, list_count: row2.list_count })
      }
    } catch (e) {
      if (DEBUG1) global.cconsole.error(e)
    }
  }
}
;(async function () {
  // while (true) {
  await okgo()
  // }
  process.exit()
})()
