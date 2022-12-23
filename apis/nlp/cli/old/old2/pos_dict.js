// import { sleep } from 'pauls-pure-functions/functions/promises.js';
import "../../global.js" // contains secret keys ~ never push to GIT!
import { data_word_get, data_get_words, data_word_put } from "@ps/nlp/api/data.words/pgdb"
import json_parse from "@techytools/fn/io/json/json_parse"
// import { arr_subtract } from 'pauls-pure-functions/functions/arrays.js';

/*
 * TODO:
 *  TODO:
 *   TODO:
 *
 * Fix row.proper -> in row.pos_dict['irish'] = [1,1,0]
 * Currently, pos_dict may have missing proper values!
 *
 * Also, make sure all row.key in DB are lowercase,
 * and all row.pos_dict[key] are lowercase!
 */

/*
 *
 * GET FIRST SET OF ROWS:
 *
 */
;(async function () {
  // get words list
  let rows: any = await data_get_words(
    `vrsn < 10 AND list_count IS NOT NULL AND list_count>=1 ORDER BY vrsn DESC LIMIT 1000`
  ) // vrsn < 6000 AND
  // validate
  if (!rows || !rows.length) {
    console.error(!rows ? "!rows" : "!rows.length")
    global.execute("pm2 stop all")
    throw new Error(!rows ? "!rows" : "!rows.length")
  }
  /*
   * Each DB row
   */
  for (let row of rows) {
    if (!row || !row.key) return
    for (let prop in row) {
      row[prop] = json_parse(row[prop])
    }

    /*
     *
     * START DATA MANIPULATION:
     *
     */
    /*
     * First, compile dictionary of { word:info, },
     * where key is word string, and value is [1,0,0]
     */
    let all_words_dict: any = {}
    for (let pos in row.pos_dict) {
      let posdict = row.pos_dict[pos]
      for (let word in posdict) {
        let info = posdict[word]
        let wrow: any = await data_word_get(word, "ws_sentiment, proper")
        if (wrow) {
          info[0] = wrow.ws_sentiment === -1 ? 0 : 1
        }
        all_words_dict[word] = { info, pos }
      }
    }
    /*
     * Then, iterate row.list words, because they are in order!
     * And re-assemble row.pos_dict in this order.
     */
    let new_pos_dict: any = {}
    for (let word of row.list) {
      let obj = all_words_dict[word]
      if (obj) {
        // pos
        let pos = obj.pos
        if (!new_pos_dict[pos]) {
          new_pos_dict[pos] = {}
        }
        // info
        new_pos_dict[pos][word] = obj.info
      }
    }

    /*
     *
     * SAVE ROW
     *
     */
    let setRow: any = {
      key: row.key,
      vrsn: 10,
      pos_dict: new_pos_dict
    }
    // console.log(setRow);
    // console.log(row.key);
    await data_word_put(setRow)
  }

  process.exit()
})()
