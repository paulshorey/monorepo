// import { sleep } from 'pauls-pure-functions/functions/promises.js';
import "dotenv/config" // contains secret keys ~ never push to GIT!
import "common/global.js" // contains secret keys ~ never push to GIT!
import { data_domains_get, data_domain_put } from "@ps/nlp/api/data.domains/pgdb"

/*
 *
 * GET FIRST SET OF ROWS:
 *
 */
;(async function () {
  const rows = await data_domains_get("key,syns", `WHERE syns IS NOT NULL AND syns!='' AND (vrsn IS NULL OR vrsn<2)`)

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
     * Save to DB initially (failsafe, new version)
     */
    global.cconsole.info(row.key)
    row.vrsn = 1
    row.timestamp = Date.now()
    await data_domain_put(row)

    /*
     * Edit row
     */
    let syns = row.syns
      .replace(/[^\w\d\s,'\-]+/, "")
      .split(",")
      .map((str) => str.trim())
      .filter((str) => !!str)
    row.syns = JSON.stringify(syns)
    global.cconsole.log(row.syns)

    /*
     * Save to DB (changes)
     */
    row.vrsn = 2
    row.timestamp = Date.now()
    await data_domain_put(row)
  }

  process.exit()
})()
