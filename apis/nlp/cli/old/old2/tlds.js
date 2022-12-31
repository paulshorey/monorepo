// import { sleep } from 'pauls-pure-functions/functions/promises.js';
import "../../process.js" // contains secret keys ~ never push to GIT!
import "common/global.js"
// import { data_word_get, data_get_words, data_word_put } from '@api/data.words/pgdb.js'
// import { json_parse } from 'pauls-pure-functions/functions/objects.js'
import { data_domains_get_all } from "@api/data.domains/pgdb"
import domain_row_update from "@api/data.domains/promise/row_update"

/*
 *
 * GET FIRST SET OF ROWS:
 *
 */
;(async function () {
  /*
   * Rows
   */
  const rows = await data_domains_get_all("key", {})

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
      global.cconsole.error(!row ? "!row" : "!row.key")
      global.execute("pm2 stop all")
      throw new Error(!row ? "!row" : "!row.key")
    }

    /*
     * UPDATE ROW
     */
    let row_updated: any = await domain_row_update({ key: row.key })

    /*
     * LOG
     */
    // consolee.log('edited row "' + row.key + '"')
    // console.log('before', [row.syns1.length, row.syns2.length, row.syns3.length])
    // console.log('after', [row_updated.syns1.length, row_updated.syns2.length, row_updated.syns3.length])

    // break
  }

  process.exit()
})()
