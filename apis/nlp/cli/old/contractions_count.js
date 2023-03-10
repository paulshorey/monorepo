// import { sort_strings_by_length } from "pauls-pure-functions/functions/sort_words"
// import { sleep } from "pauls-pure-functions/functions/promises"
// import key_row from "@api/data.words/promise/key"
import { anonFunction } from "pauls-pure-functions/functions/functions"
import "dotenv/config" // contains secret keys ~ never push to GIT!
import "common/global.js" // contains secret keys ~ never push to GIT!
import { data_word_get_parsed, data_word_put } from "@api/data.words/pgdb"
import key_model from "@api/data.words/function/key_model"
import contractions from "@techytools/constants/data/words/contractions"
global.exit = function () {
  process.exit()
}
global.kill = function () {
  global.execute("kill " + process.pid)
}

anonFunction(async () => {
  /*
   * Read each line and parse contractions and synonyms
   */

  for (let str in contractions) {
    let syns = contractions[str].split(" , ").map(w => w.trim()).filter(w => !!w) // prettier-ignore
    if (!syns.length) continue
    // if (str[0] === "'") str = str.substr(1)
    // if (str[str.length - 1] === "'") str = str.substring(0, str.length - 1)
    // if (!str) continue
    // let contrs = []
    // let arr = str.split("'")
    // if (!arr[1]) contrs.push(arr[0])
    // if (arr[1]) contrs.push(arr[0] + arr[1])
    // if (arr[2]) contrs.push(arr[0] + arr[2])
    // if (arr[3]) contrs.push(arr[0] + arr[3])
    // for (let contr of contrs) {
    //   contr = contr.trim()
    //   if (!contr.length) continue

    let contr = str
    if (!contr) continue
    // console.log(" ")
    // console.log(contr, syns)

    /*
     * Edit contraction row
     */
    let key = contr.replace(/[^\w\d]+/g, "").toLowerCase()
    // get row from DB
    let row: any = await data_word_get_parsed(key, "key")

    /*
     * Fix
     */
    // row.list_count = 10
    console.log('"' + row.key + '": true, ')
    /*
     * Save
     */
    await data_word_put(row)
  }

  /*
   * Done
   */
  process.exit()
})
