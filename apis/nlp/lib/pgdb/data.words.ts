/*
 * Dependencies
 */
import json_parse from "@techytools/fn/io/json/json_parse"
import is_number from "@techytools/fn/io/num/is_number"
import { phrase_capitalize } from "@ps/nlp/lib/words/functions/pos"
import dict_info from "@ps/nlp/lib/words/function/dict_info"
import str_row from "@ps/nlp/lib/words/promise/str_row"
import row_meta from "@ps/nlp/lib/words/function/row_meta"
import key_sanitized from "@ps/nlp/lib/words/function/key_sanitized"
import { makeSQLString } from "@ps/nlp/lib/pgdb"

/*
 * Debugging
 */
let EXITONERROR = true // exit on error - for testing
let DEBUG1 = true // allow short messages: api name and parameters
let DEBUG2 = false // allow lengthy messages: queryString
if (DEBUG2 || DEBUG1) {
  process.on("uncaughtException", (err) => {
    global.execute("pm2 stop all")
  })
}

/**************************************************************************************************
 * LEGACY FUNCTIONS
 **************************************************************************************************/

export const crawl_stopwords_get = function (key) {
  return new Promise(async (resolve) => {
    let queryString = `SELECT key, occurrences FROM crawl.stopwords WHERE key=e'${key.replace(/[']+/g, "''")}'`
    global.pgdb
      .query(queryString)
      .then((res) => {
        if (res.rows.length) {
          resolve(res.rows[0])
        } else {
          resolve(null)
        }
      })
      .catch((err) => {
        if (DEBUG2 || DEBUG1) global.cconsole.error(err)
        resolve(null)
      })
  })
}

export const crawl_word_get = function (key, columns, limit = 1000) {
  let selectWhat = "key"
  if (typeof columns === "string") {
    selectWhat = columns
  }
  if (columns && Array.isArray(columns)) {
    selectWhat = columns.toString()
  }
  return new Promise(async (resolve) => {
    key = key.toLowerCase()
    let queryString = `SELECT ${selectWhat} FROM crawl.words WHERE key=e'${key.replace(/[']+/g, "''")}' LIMIT ${limit}`
    global.pgdb
      .query(queryString)
      .then((res) => {
        if (res.rows.length) {
          resolve(res.rows[0])
        } else {
          resolve(null)
        }
      })
      .catch((err) => {
        if (DEBUG2 || DEBUG1) global.cconsole.error(err)
        resolve(null)
      })
  })
}

/**************************************************************************************************
 * FUNCTIONS
 **************************************************************************************************/

export const data_word_delete = function (key) {
  return new Promise(async (resolve) => {
    let queryString = `DELETE FROM data.words WHERE key=e'${key.replace(/[']+/g, "''")}'`
    global.pgdb
      .query(queryString)
      .then(() => {
        if (DEBUG1) global.cconsole.warn("deleted ", key)
        resolve(true)
      })
      .catch((err) => {
        if (DEBUG1) global.cconsole.error(`could not delete "${key}"`, err)
        resolve(null)
      })
  })
}

/**
 * Check if a key will still be unique in DB after it is sanitized
 *    If it will not be unique, then compare which DB row is better,
 *    and keep the better one (better = higher row.list_count).
 *    Delete the inferior row.
 * @param row {object} - DB row
 * @resolves {object|null} - If passed row is the better one (higher row.list_count),
 *    return it, with updated meta (str, key, proper, acronym).
 *    If passed row is inferior, delete it, return null. Stop.
 */
export const data_key_str_unique = async function (row) {
  /*
   * str vs key, usually is the same, sometimes punctuated
   */
  let key_cleaned = key_sanitized(row.key)
  if (DEBUG2) global.cconsole.warn(`data_key_str_unique key "${row.key}" vs key_cleaned "${key_cleaned}"`)
  if (key_cleaned === row.key.toLowerCase()) {
    // no difference - continue
    if (DEBUG2) global.cconsole.warn("no difference - continue")
    row = row_meta(row) // fix meta (str, proper, acronym, key)
    return row
  }
  /*
   * compare which row is better, keep the better one
   */
  // NOTE: row_meta REQUIRES: key, proper, ctr, acronym, str, abbreviation, singular, plural, root
  let row_cleaned: any = await data_word_get(key_cleaned, "key,proper,acronym,abbreviation,list_count,conjunction")
  let row_old: any = await data_word_get(
    row.key,
    "key, proper, ctr, acronym, str, abbreviation, singular, plural, root,list_count,conjunction"
  )
  // combine row in DB plus the passed in row, presumably user-submitted form with updates
  row = { ...row_old, ...row }
  // compare
  if (!row_cleaned) {
    // no duplicate: continue
    if (DEBUG2) global.cconsole.warn("no entry for cleaned version: continue", row.key)
    // row = row_meta(row) // fix meta (str, proper, acronym, key)
    return row
  } else if (row.list_count >= row_cleaned.list_count) {
    // dirty key is better: remove cleaned
    if (DEBUG2) global.cconsole.warn("dirty key is better: remove cleaned", key_cleaned)
    await data_word_delete(key_cleaned)
    // row = row_meta(row) // fix meta (str, proper, acronym, key)
    return row
  } else {
    // cleaned key is better: remove this one (with punctuation)
    if (DEBUG2) global.cconsole.warn("cleaned key is better: remove this one (with punctuation)", row.key)
    await data_word_delete(row.key)
    return null
  }
}

export const data_word_get = function (str, columns = "", limit = 1000) {
  let key = str
    .replace(/[^\w\d\-]+/g, "")
    .toLowerCase()
    .trim()
  // get what columns?
  let selectWhat = ""
  if (typeof columns === "string") {
    selectWhat = columns
  }
  if (columns && Array.isArray(columns)) {
    selectWhat = columns.toString()
  }
  if (selectWhat === "") {
    selectWhat = "*"
  } /*else if (!selectWhat.includes("email")) {
    selectWhat += ",email" // required fields
  }*/
  return new Promise(async (resolve) => {
    key = key.toLowerCase()
    let queryString = `SELECT ${selectWhat} FROM data.words WHERE key=e'${key.replace(
      /[']+/g,
      "''"
    )}' ORDER BY list_count DESC LIMIT ${limit}`
    global.pgdb
      .query(queryString)
      .then((res) => {
        if (res.rows.length) {
          resolve(res.rows[0])
        } else {
          resolve(null)
        }
      })
      .catch((err) => {
        DEBUG2 || DEBUG1 ? global.cconsole.error(err) : null
        resolve(null)
      })
  })
}

export const data_word_get_parsed = function (key, columns?: any, limit?: any) {
  if (DEBUG2) global.cconsole.log("data_word_get_parsed", key)
  return new Promise(async (resolve) => {
    let row: any = await data_word_get(key, columns, limit)
    if (!row || typeof row !== "object") {
      resolve(null)
    }
    for (let prop in row) {
      row[prop] = json_parse(row[prop])
    }
    resolve(row)
  })
}

// export const data_word_add = function (key) {
//   let i_last = key.length - 1
//   // capitalization matters
//   let proper = ""
//   let acronym = ""
//   if (key !== key.toLowerCase()) {
//     // if two out of three first letters are uppercase, count the whole thing as uppercase
//     let upper =
//       (key[0] === key[0].toUpperCase() ? 1 : 0) +
//       (key[1] === key[1].toUpperCase() ? 1 : 0) +
//       (key[2] === key[2].toUpperCase() ? 1 : 0)
//     if (upper >= 2) {
//       // is ACRONYM
//       acronym = key.replace(/[']+/g, "''")
//     } else {
//       // is Proper
//       proper = key.replace(/[']+/g, "''")
//     }
//   }
//   // key should be lowercase
//   key = key.replace(/[']+/g, "''").toLowerCase()
//   // save
//   return new Promise(async (resolve) => {
//     try {
//       let queryString = `INSERT INTO data.words (key) VALUES (e'${key}')`
//       if (proper) {
//         queryString = `INSERT INTO data.words (key, proper) VALUES (e'${key}', e'${proper}')`
//       }
//       if (acronym) {
//         queryString = `INSERT INTO data.words (key, acronym) VALUES (e'${key}', e'${acronym}')`
//       }
//       if (DEBUG2) global.cconsole.log(queryString)
//       await global.pgdb.query(queryString)
//       resolve(true)
//     } catch (e) {
//       DEBUG2 || DEBUG1 ? global.cconsole.error(e) : null
//       resolve(false)
//     }
//   })
// }

/**
 * Save user-submitted object to DB, and do some minor fixes
 * @param row {object} - DB row, with key (required) for lookup, plus any other properties to overwrite
 * @param REBUILD {boolean}
 * @resolves {boolean} - true (success / updated DB row), false (failed / did not update)
 */
export const data_word_put = async function (row, REBUILD = false) {
  let primaryKey = "id" // key
  if (DEBUG2) {
    global.cconsole.warn("data_word_put", JSON.stringify(row).substr(0, 100))
  } else if (DEBUG1) {
    global.cconsole.warn("data_word_put", row[primaryKey])
  }
  // required parameters
  if (!row[primaryKey]) {
    return undefined
  }

  // manually edited
  row.timestamp = Date.now()

  // temp fix
  delete row.add_syn
  delete row.fix_pos

  // update
  try {
    // success
    let queryString = makeSQLString(primaryKey, row, "data.words")
    if (DEBUG2) global.cconsole.log(queryString)
    await global.pgdb.query(queryString)
  } catch (e) {
    // failed
    DEBUG2 || DEBUG1 ? global.cconsole.error(e) : null
    global.cconsole.warn("pg global.pgdb failed", e)
    if (EXITONERROR) process.exit()
    return undefined
  }

  // done, fixed row
  return true
}

export const data_word_sentiment_of_synonym = function (key, synonym, sentiment) {
  if (DEBUG1) global.cconsole.warn("data_word_sentiment_of_synonym", key, synonym, sentiment)
  return new Promise(async (resolve) => {
    // validate
    if (!is_number(sentiment)) {
      resolve(false)
    }
    // prep
    let row: any = await data_word_get_parsed(key, "key,dict")
    if (!row || !row.dict) {
      return undefined
    }

    /*
     * First, edit synonym's row .sentiment
     */
    let synonymRow: any = {
      key: synonym,
      sentiment: sentiment
      // agg_sentiment: sentiment === 1 ? 1001 : sentiment === -1 ? 1 : 101
    }
    if (!(await data_word_put(synonymRow, true))) {
      resolve(false)
    }

    /*
     * Then, edit row's .dict info
     */
    for (let word in row.dict) {
      let info = row.dict[word]
      if (!info) continue
      // update sentiment
      if (word === synonym) {
        info[0] = sentiment >= 0 ? 1 : 0 // convert from -1/0/1 to 0/1
        info[2] = 0
      }
    }

    /*
     * Save final edited row
     */
    if (!(await data_word_put(row, true))) {
      resolve(false)
    }
    resolve(true)
  })
}

export const data_word_proper_of_synonym = function (key, synonym, newProper) {
  return new Promise(async (resolve) => {
    // validate
    if (!is_number(newProper)) {
      resolve(false)
    }
    // prep
    let row: any = await data_word_get_parsed(key)
    if (!row) {
      return
    }

    /*
     * First, edit synonym's .proper
     */
    let synonymRow: any = {
      key: synonym,
      proper: newProper ? phrase_capitalize(synonym) : ""
    }
    if (!(await data_word_put(synonymRow, true))) {
      resolve(false)
    }

    /*
     * Then, edit row's .dict info
     */
    for (let word in row.dict) {
      let info = row.dict[word]
      // update sentiment
      if (word === synonym) {
        info[1] = newProper
      }
    }

    /*
     * Save final edited row
     */
    if (!(await data_word_put(row, true))) {
      resolve(false)
    }
    resolve(true)
  })
}

export const data_word_remove_words = function ({ key, words }) {
  if (DEBUG1) global.cconsole.warn("data_word_remove_words", { key, words })
  return new Promise(async (resolve) => {
    // validate
    if (!key || !Array.isArray(words)) {
      resolve(false)
    }
    // get row
    let row: any = await data_word_get_parsed(key)
    if (!row) {
      resolve(false)
    }

    /*
     * remove each word from row.dict
     */
    for (let word of words) {
      // delete from row.dict
      delete row.dict[word]
    }

    /*
     * Save final edited row
     */
    if (!(await data_word_put(row, true))) {
      resolve(false)
    }
    if (DEBUG1) global.cconsole.warn("deleted", row)
    resolve(true)
  })
}

export const data_word_add_poswords = function ({ key, pos, poswords: new_words }) {
  let DEBUG1 = false
  if (DEBUG1) global.cconsole.warn("data_word_add_poswords", { key, pos, new_words })
  return new Promise(async (resolve) => {
    // validate
    if (!key || !pos || !Array.isArray(new_words)) {
      if (DEBUG1) global.cconsole.error("!key || !pos || !Array.isArray(new_words), exit")
      resolve(false)
    }
    // get row
    let row: any = await data_word_get_parsed(key)
    if (!row) {
      if (DEBUG1) global.cconsole.error("!row, exit")
      resolve(false)
    }

    /*
     * add new_words to new_dict
     */
    let new_dict: any = {}
    // first, add new words ***to beginning of dict***
    for (let word of new_words) {
      if (word) {
        // find synonym in db
        let wrow
        try {
          wrow = await data_word_get_parsed(word)
          if (DEBUG1) global.cconsole.success(`found row for word="${word}"`)
        } catch (e) {
          throw `errored on word="${word}", ${e.toString()}`
        }
        // add synonym as row to db
        if (!wrow) {
          // make row
          wrow = await str_row(row.key)
          await data_word_put(wrow, false)
        }
        // add synonym to row
        // fix pos of new word
        wrow.pos1 = pos
        // add new word to row.dict
        new_dict[word] = dict_info(wrow, pos, true)
        new_dict[word][0] = 1 // sentiment is positive (or at least "not offensive")
        new_dict[word][2] = 0 // sentiment is *not* unknown
      }
    }
    // then, add previous words ***to the end of dict***
    for (let w in row.dict) {
      let info = row.dict[w]
      if (!new_dict[w]) {
        new_dict[w] = info
      }
    }
    // save dict
    row.dict = new_dict

    /*
     * Log
     */
    if (DEBUG1) global.cconsole.success(row.key)
    if (DEBUG1) global.cconsole.success(row.pos1)
    for (let key in row.dict) {
      if (new_words.includes(key)) {
        if (DEBUG1) global.cconsole.success(key, row.dict[key])
      }
    }

    /*
     * Save final edited row
     */
    if (!(await data_word_put(row, false))) {
      resolve(false)
    }
    if (DEBUG1) global.cconsole.warn("final row.dict[word] is ...", row.dict && row.dict[(new_words || [])[0]])
    resolve(true)
  })
}

export const data_word_add_to_others = function ({ word, pos, addtoothers }) {
  return new Promise(async (resolve) => {
    // let keylist = addtoothers.split(',').map(w => w.trim())
    // for (let key of keylist) {
    //   if (!await data_word_add_new_words({ key, pos, new_words: [word] })) {
    //     resolve(false)
    //   }
    // }
    // resolve(true)
    throw new Error("API not available")
  })
}

export const data_get_words = function (where, columns = "*", limit = 500) {
  return new Promise(async (resolve) => {
    /*
     * Upgrade existing (crawled) rows:
     */
    let queryString = `SELECT ${columns} FROM data.words WHERE ${where} LIMIT ${limit}`
    global.pgdb
      .query(queryString)
      .then((res) => {
        if (res.rows.length) {
          // reset sources (redo crawl)
          res.rows = res.rows.map((row) => {
            // row.sources = [];
            return row
          })
          // return as usual
          resolve(res.rows)
        } else {
          // nothing found
          throw new Error("Found no results for queryString: " + queryString)
        }
      })
      .catch((err) => {
        global.cconsole.error(err)
        resolve(null)
      })
  })
}

/**
 * Sort words by sentiment
 * Besides getting the sentiment of a word, this is a great function to
 * check that strings in a list are real words (have entries in the database)
 * @param list {array} - array of keys, to check against database
 * @param orderby_prop {string} - ex: what to order by 'agg_sentiment'
 * @param orderby_desc {string} - ex: "DESC" or "ASC"
 * @resolves {array} - array of objects [{key:"",something:""},], sorted by sentiment
 */
export const data_word_sort_keys_by_sentiment = function (list, orderby_prop = "", orderby_desc = "DESC") {
  return new Promise(async (resolve) => {
    let inlist = list.join("','") || ""
    if (!inlist) {
      resolve(null)
    }
    let props = "key"
    let orderby = ""
    if (orderby_prop) {
      orderby = `${orderby_prop} IS NOT NULL ORDER BY ${orderby_prop} ${orderby_desc}`
      props += ", " + orderby_prop
    }
    /*
     * get row of each synonym
     */
    let queryString = `SELECT ${props} FROM crawl.words WHERE key IN ('${inlist}') ${orderby}`
    global.pgdb
      .query(queryString)
      .then((res) => {
        if (res.rows.length) {
          // return results
          resolve(res.rows)
        } else {
          // nothing found, but that's ok!
          resolve(null)
          // throw new Error("Found no results for queryString: " + queryString)
        }
      })
      .catch((err) => {
        global.cconsole.error(err)
        resolve(null)
      })
  })
}
