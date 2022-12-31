// : 4 ││ words > (node:19714) ExperimentalWarning: The ESM module loader is experimental.         │
// │                                     ││ words > !pos1 youre  (function/row_meta.js:288)                                          │
// │                                     ││ words > TypeError: row.poss[row.pos1] is not iterable                                    │
// │                                     ││ words >     at file:///srv/nlp-be/api/data.words/promise/row_tlds.js:83:49               │
//   │                                     ││ words >     at new Promise (<anonymous>)                                                 │
// │                                     ││ words >     at default (file:///srv/nlp-be/api/data.words/promise/row_tlds.js:42:10)     │
// │                                     ││ words >     at file:///srv/nlp-be/api/data.words/promise/str_row.js:183:15               │
//   │                                     ││ words >     at processTicksAndRejections (internal/process/task_queues.js:97:5)          │
// │                                     ││ words > (node:19741) ExperimentalWarning: The ESM module loader is experimental.         │
// │                                     ││ words > !pos1 youre  (function/row_meta.js:288)

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
  const rows = await data_get_words(
    `vrsn < 415 AND vrsn IS NOT NULL AND list_count IS NOT NULL AND list ILIKE e'%"tiger"%' ORDER BY list_count`,
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

    /*
     * Save to DB (failsafe, new version)
     */
    row.vrsn = 415
    row.timestamp = Date.now()
    await data_word_put(row)

    /*
     * Get/Edit row
     */
    row = await str_row(row.key, { REBUILD: true })

    /*
     * Save to DB (changes)
     */
    row.vrsn = 420
    row.timestamp = Date.now()
    await data_word_put(row)

    /*
     * LOG
     */
    console.log(row.key, row.list_count)
  }

  process.exit()
})()
