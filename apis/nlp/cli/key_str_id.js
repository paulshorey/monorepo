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
;(async function () {
  /*
   * Which rows to use
   */
  //row.key.length === 4 && row.key.substr(-1) === "e" && row.list_count < 15
  const rows = await data_get_words(
    `vrsn < 550 AND vrsn IS NOT NULL AND list_count IS NOT NULL AND char_count=4 AND list_count=150 ORDER BY list_count DESC, timestamp DESC`,
    "key, acronym, abbreviation",
    500
  )
  // then, do anything with 15, and ws_sentiment=1 and <15

  /*
   * Validate words
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
    console.log(row.key)

    /*
     * Save to DB (failsafe, new version)
     */
    row.vrsn = 550
    row.timestamp = Date.now()
    await data_word_put(row)

    /*
     * Get/Edit row
     */
    row = await str_row(row.key, { REBUILD: true })

    /*
     * Save to DB (changes)
     */
    row.vrsn = 550
    row.timestamp = Date.now()
    await data_word_put(row)

    /*
     * LOG
     */
    console.log(row.key, row.list_count)
  }

  process.exit()
})()
