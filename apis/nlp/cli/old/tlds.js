// import { sleep } from "pauls-pure-functions/functions/promises"
import "dotenv/config" // contains secret keys ~ never push to GIT!
import "common/global.js" // contains secret keys ~ never push to GIT!
import { data_domains_get_parsed, data_domain_put } from "@ps/nlp/api/data.domains/pgdb"
// import domain_syns_of_syns from "@ps/nlp/api/data.domains/promise/key_syns_of_syns"
// import str_row from "@ps/nlp/api/data.words/promise/str_row"

/*
 *
 * GET FIRST SET OF ROWS:
 *
 */
let DEBUG2 = false
import domain_row_update from "@ps/nlp/api/data.domains/promise/row_update"
;(async function () {
  /*
   * Rows to loop through and fix
   */
  const rows = await data_domains_get_parsed(
    "key, syns, syns1, syns2",
    // `WHERE key='cooking'`
    `WHERE (vrsn < 85 OR vrsn IS NULL) ORDER BY rank DESC LIMIT 50`
  ) // AND vrsn IS NOT NULL
  // `WHERE key='tube'`

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
     * Separate debugging property
     */
    let row_syns2 = row.syns2
    delete row.syns2

    /*
     * Save to DB (failsafe, new version)
     */
    // let tld_row: any = await str_row(row.key)
    // if (tld_row && tld_row.pos_short && tld_row) {
    //   if (tld_row.pos_short.all) {
    //     row.syns = [...new Set([...row.syns, ...tld_row.pos_short.all])]
    //   }
    // }, syns: row.syns
    await data_domain_put({ key: row.key, vrsn: 85, timestamp: Date.now() })

    /*
     * Get/Edit row
     */
    let rowEdited: any = await domain_row_update(row)
    if (rowEdited) {
      if (DEBUG2) global.cconsole.success(`updated ${rowEdited.key}`)
      if (DEBUG2) global.cconsole.log(rowEdited)
    } else {
      if (DEBUG2) global.cconsole.warn(`could not update row`)
    }

    /*
     * Save to DB (changes)
     */
    await data_domain_put({ key: row.key, vrsn: 90, timestamp: Date.now() })
    if (DEBUG2) global.cconsole.log("data_domain_put success")

    /*
     * LOG
     */
    if (row_syns2 && rowEdited && row_syns2.length !== rowEdited.syns2.length) {
      global.cconsole.warn(row.key + ` fixed: before=(${row_syns2.length}) after=(${rowEdited.syns2.length})`)
    } else {
      global.cconsole.info(row.key + " ok")
    }
  }

  process.exit()
})()
