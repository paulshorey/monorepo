// import { sleep } from 'pauls-pure-functions/functions/promises.js';
import "dotenv/config" // contains secret keys ~ never push to GIT!
import "common/global.js" // contains secret keys ~ never push to GIT!
import { data_word_put } from "@api/data.words/pgdb"
import str_row from "@api/data.words/promise/str_row"
import words from "@techytools/constants/data/words/dict/contractions"
// let names: any = {"haq":1,"pon":1,"aly":1}

/*
 *
 * GET FIRST SET OF ROWS:
 *
 */
;(async function () {
  /*
   * Each row
   */
  let done = 0
  for (let name in words) {
    console.log("name", name)
    /*
     * Validate row
     */
    if (!name) {
      global.cconsole.error("!name")
      continue
    }

    /*
     * Already done
     */
    done++
    // try {
    //   let check: any = await data_word_get(name, "key,name,list_count")
    //   if (
    //     check &&
    //     (check.list_count >= 25 ||
    //       (check.key.length === 4 && check.list_count >= 10) ||
    //       (check.key.length <= 3 && check.list_count >= 5))
    //   ) {
    //     console.log("skip " + done + " " + (name===check.key ? name : name+'/'+check.key))
    //     continue
    //   }
    // } catch(e) {
    //   global.cconsole.error(e)
    // }

    /*
     * Get/Edit row
     */
    let row: any = await str_row(name)

    /*
     * Save to DB (changes)
     */
    row.vrsn = 175
    row.timestamp = Date.now()
    await data_word_put(row)
    global.cconsole.warn("put " + row.key)
    console.log(row.key, done, [row.list_count])
  }

  process.exit()
})()
