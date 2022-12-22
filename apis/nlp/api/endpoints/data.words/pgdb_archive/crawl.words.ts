/*
 * Dependencies
 */
import json_parse from "@ps/fn/io/json/json_parse"
// DB
import { Pool } from "pg"
import customEnv from "custom-env"

customEnv.env("local")
customEnv.env()
const pool = new Pool()
// execute shell
import import_child_process from "child_process"

const exec = import_child_process.exec
const execute = function (command, callback?: Function) {
  exec(command, function (error, stdout) {
    if (error) {
      global.cconsole.error(error)
    }
    if (callback) {
      callback(stdout)
    }
  })
}

/*
 * Logging
 */
process.on("uncaughtException", (err) => {
  execute("pm2 stop all")
})

/*
 * Eventually I'd like to make a table in the database for these lists
 */
export const get_manual_sentiment = function get_manual_sentiment(word) {
  if (word.includes("slave") || word.includes("cleaning")) {
    return -1
  }
  let goodwords = [
    "nipponese",
    "british",
    "english",
    "french",
    "italian",
    "brazilian",
    "german",
    "canadian",
    "asian",
    "japanese",
    "denizen",
    "quirky",
    "curious",
    "kinky",
    "bluesy",
    "laughter",
    "hoot",
    "laugh",
    "giggle",
    "flowers",
    "light",
    // shift aggregated score away from common mistakes
    "black",
    "ebony",
    "sable",
    "jet",
    "birch"
  ]
  let okwords = [
    "yosemite",
    "jehovah",
    "foot",
    "movie",
    "wacky",
    "sappy",
    "dopey",
    "odd",
    "batty",
    "yeasty",
    "kooky",
    "weird",
    "belly laugh",
    "leggings",
    "dungarees",
    "drawers",
    "bloomers",
    "knickerbockers",
    "lobster",
    "shellfish",
    "carapace",
    "xxx",
    "crustacean"
  ]
  let badwords = [
    // cultural sensitivity
    "dated",
    "housewifery",
    "deity",
    "red",
    "blacklist",
    "nigritude",
    "fat",
    "broom",
    "mop",
    "swab",
    "inky",
    "white",
    "black",
    "cretin",
    "boy",
    "cleaning",
    "labor",
    "honky",
    "colored",
    "whitey",
    "pygmy",
    "blacks",
    "egg",
    "blanch",
    "pale",
    "pasty",
    "yellow",
    "negroid",
    "mongoloid",
    "caucasoid",
    "alcoholic",
    "booze",
    "boozehound",
    "drunk",
    "drinking",
    "sex",
    "boozy",
    "drunken",
    "intoxicated",
    "inebriated",
    "plastered",
    "drunkard",
    "inebriate",
    // wrong by IBM
    "mordant",
    "lecher",
    "woman of the street",
    "streetwalker",
    "puta",
    "gigolo",
    "cyprian",
    "hussy",
    "bimbo",
    "hussy",
    "floozie",
    "hoochie",
    "chippie",
    "trull",
    "bawd",
    "pimp",
    "streetwalker",
    "call girl",
    "tart",
    "floozie",
    "street girl",
    "sex worker",
    "working girl",
    "sap",
    // not useful in results
    "bondwoman",
    "villein",
    "peon",
    "soso",
    "fetid",
    "noisome",
    "foetid",
    "foulsmelling",
    // sexual or weird
    "hoe",
    "hail",
    "nark",
    "shamus",
    "dong",
    "semen",
    "cum",
    "liquid body substance"
  ]
  // in list
  if (badwords.includes(word)) {
    return -1
  } else if (goodwords.includes(word)) {
    return 1
  } else if (okwords.includes(word)) {
    return 0
  } else {
    return undefined
  }
}

/*
 * Functions
 */
export const increment_stopwords = function increment_stopwords(key, attempt = 1) {
  key = key.replace(/[']+/g, "''")
  return new Promise(async (resolve) => {
    resolve(null)
    // enough tries, get on with it
    if (attempt > 10) {
      global.cconsole.error("increment_stopwords failed to write 10 times in a row!")
      resolve(null)
    }
    // keep trying a few times,
    // to avoid duplicate key conflict if simultaneous write operation from multiple processes
    let queryString = `SELECT * FROM crawl.stopwords WHERE key=e'${key}' LIMIT 1`
    pool
      .query(queryString)
      .then((res) => {
        if (res && res.rows && res.rows.length) {
          // row exists
          // edit +1
          let queryString = `UPDATE crawl.stopwords SET occurrences = COALESCE(occurrences, 0) + 1 WHERE key=e'${key}'`
          pool
            .query(queryString)
            .then(() => {
              resolve(null)
            })
            .catch((err) => {
              global.cconsole.error(err)
              resolve(null)
            })
        } else {
          // add new row
          let queryString = `
                    INSERT INTO crawl.stopwords (key, occurrences) VALUES (e'${key}', 1) 
                    ON CONFLICT DO NOTHING
                    `
          pool
            .query(queryString)
            .then(() => {
              resolve(null)
            })
            .catch(async (err) => {
              global.cconsole.warn(err)
              await increment_stopwords(key, attempt + 1)
              resolve(null)
            })
        }
      })
      .catch((err) => {
        global.cconsole.error(err)
        // add new row
        let queryString = `
                INSERT INTO crawl.stopwords (key, occurrences) VALUES (e'${key}', 1) 
                ON CONFLICT DO NOTHING
                `
        pool
          .query(queryString)
          .then(() => {
            resolve(null)
          })
          .catch(async (err) => {
            global.cconsole.warn(err)
            await increment_stopwords(key, attempt + 1)
            resolve(null)
          })
      })
  })
}
export const increment_failedSource = function (name, key) {
  key = key.replace(/[']+/g, "''").toLowerCase() // also must escape stringified source.words_affected
  return new Promise(async (resolve) => {
    resolve(null)
    let queryString = `SELECT * FROM crawl.sources WHERE name='${name}' LIMIT 1`
    pool
      .query(queryString)
      .then((res) => {
        if (res && res.rows && res.rows.length) {
          // row exists
          let source = res.rows[0]
          // add trouble key to array
          try {
            source.failed_count++
            source.words_affected = JSON.parse(source.words_affected)
            if (!source.words_affected.includes(key)) {
              source.words_affected.push(key)
            }
            source.words_affected = JSON.stringify(source.words_affected).replace(/[']+/g, "''").replace(/''''/g, "''")
          } catch (e) {
            source.failed_count = 0
            source.words_affected = "[]"
          }
          // edit +1
          let queryString = `UPDATE crawl.sources SET failed_count = ${source.failed_count}, words_affected=e'${source.words_affected}' WHERE name='${name}'`
          pool
            .query(queryString)
            .then(() => {
              resolve(null)
            })
            .catch((err) => {
              global.cconsole.error(err)
              resolve(null)
            })
        } else {
          // add new row
          let queryString = `INSERT INTO crawl.sources (name, failed_count, words_affected) VALUES ('${name}', 1, e'["${key}"]')`
          pool
            .query(queryString)
            .then(() => {
              resolve(null)
            })
            .catch((err) => {
              global.cconsole.error(err)
              resolve(null)
            })
        }
      })
      .catch((e) => {
        global.cconsole.warn(e)
        // add new row
        let queryString = `INSERT INTO crawl.sources (name, failed_count, words_affected) VALUES ('${name}', 1, e'["${key}"]')`
        pool
          .query(queryString)
          .then((res) => {
            resolve(null)
          })
          .catch((err) => {
            global.cconsole.error(err)
            resolve(null)
          })
      })
  })
}
export const reset_failedSource = function (name) {
  pool.query(`UPDATE crawl.sources SET failed_count = 0, words_affected='[]' WHERE name='${name}'`)
}

export const get_word = function get_word(key, { keepCase }: any = {}) {
  return new Promise(async (resolve) => {
    key = key.replace(/[']+/g, "''")
    if (!keepCase) {
      key = key.toLowerCase().trim()
    }
    let queryString = `SELECT * FROM crawl.words WHERE key=e'${key}'`
    pool
      .query(queryString)
      .then((res) => {
        if (res && res.rows && res.rows.length) {
          resolve(res.rows[0])
        } else {
          resolve(null)
        }
      })
      .catch((err) => {
        global.cconsole.error(err)
        resolve(null)
      })
  })
}

export const get_word_parsed = function (key) {
  return new Promise(async (resolve) => {
    let row: any = await get_word(key)
    if (!row || row === null || typeof row !== "object") {
      resolve(row)
    }
    for (let prop in row) {
      row[prop] = json_parse(row[prop])
    }
    resolve(row)
  })
}
export const get_list_count = function (key) {
  return new Promise(async (resolve) => {
    key = key.replace(/[']+/g, "''").toLowerCase()
    let queryString = `SELECT list_count FROM crawl.words WHERE key=e'${key}'`
    pool
      .query(queryString)
      .then((res) => {
        if (res.rows.length) {
          resolve(res.rows[0])
        } else {
          resolve(null)
        }
      })
      .catch((err) => {
        global.cconsole.error(err)
        resolve(null)
      })
  })
}
export const get_singular_of_key = function (key) {
  return new Promise(async (resolve) => {
    // plural input can be Capitalized ~ will check for exact string, and also lowercase version
    let queryString = `SELECT key, list_count FROM crawl.words WHERE (plural=e'${key.replace(
      /[']+/g,
      "''"
    )}' OR plural=e'${key
      .toLowerCase()
      .replace(
        /[']+/g,
        "''"
      )}') AND (list_count>=6 OR (sources_count>=4 AND list_count>=2)) ORDER BY list_count DESC LIMIT 1`
    pool
      .query(queryString)
      .then((res) => {
        if (res.rows.length) {
          resolve(res.rows[0])
        } else {
          resolve(null)
        }
      })
      .catch((err) => {
        global.cconsole.error(err)
        resolve(null)
      })
  })
}
export const get_ok_key = function (singular) {
  return new Promise(async (resolve) => {
    // plural input can be Capitalized ~ will check for exact string, and also lowercase version
    let queryString = `SELECT key, list_count FROM crawl.words WHERE (key=e'${singular.replace(
      /[']+/g,
      "''"
    )}' OR key=e'${singular
      .toLowerCase()
      .replace(
        /[']+/g,
        "''"
      )}') AND (list_count>=6 OR (sources_count>=4 AND list_count>=2)) ORDER BY list_count DESC LIMIT 1`
    pool
      .query(queryString)
      .then((res) => {
        if (res.rows.length) {
          resolve(res.rows[0])
        } else {
          resolve(null)
        }
      })
      .catch((err) => {
        global.cconsole.error(err)
        resolve(null)
      })
  })
}
export const get_word_sentiment = function (key) {
  return new Promise(async (resolve) => {
    key = key.replace(/[']+/g, "''").toLowerCase()
    let queryString = `SELECT proper, plural, name, sentiment, sentiment, list_count FROM crawl.words WHERE key=e'${key}'`
    pool
      .query(queryString)
      .then((res) => {
        if (res.rows.length) {
          let row = res.rows[0]
          let masent = get_manual_sentiment(key)
          if (!isNaN(masent)) {
            row.sentiment = masent
          }
          resolve(row)
        } else {
          resolve(null)
        }
      })
      .catch((err) => {
        global.cconsole.error(err)
        resolve(null)
      })
  })
}
export const get_word_root = function (key) {
  return new Promise(async (resolve) => {
    key = key.replace(/[']+/g, "''").toLowerCase()
    let queryString = `SELECT root FROM crawl.words WHERE key=e'${key}'`
    pool
      .query(queryString)
      .then((res) => {
        if (res.rows.length) {
          let row = res.rows[0]
          resolve(row.root)
        } else {
          resolve(null)
        }
      })
      .catch((err) => {
        global.cconsole.error(err)
        resolve(null)
      })
  })
}
export const get_old_pos = function (key) {
  return new Promise(async (resolve) => {
    key = key.replace(/[']+/g, "''").toLowerCase()
    let queryString = `SELECT pos1, pos2, pos3 FROM backup1003.words WHERE key=e'${key}'`
    pool
      .query(queryString)
      .then((res) => {
        if (res.rows.length) {
          resolve(res.rows[0])
        } else {
          resolve(null)
        }
      })
      .catch((err) => {
        global.cconsole.error(err)
        resolve(null)
      })
  })
}
export const get_word_pos = function (key) {
  return new Promise(async (resolve) => {
    key = key.replace(/[']+/g, "''").toLowerCase()
    let queryString = `SELECT pos1, pos2, pos3 FROM crawl.words WHERE key=e'${key}'`
    pool
      .query(queryString)
      .then((res) => {
        if (res.rows.length) {
          resolve(res.rows[0])
        } else {
          resolve(null)
        }
      })
      .catch((err) => {
        global.cconsole.error(err)
        resolve(null)
      })
  })
}
export const get_reverse_list_acronyms = function (key) {
  return new Promise(async (resolve) => {
    key = key.replace(/[']+/g, "''").toLowerCase()
    let queryString = `SELECT key, acronym, list_count, (length(sources) - length(replace(list, e'"${key}"', '')) / length(e'"${key.replace(
      /[']+/g,
      "''"
    )}"')) AS occurrences FROM crawl.words WHERE list_count>1 AND key!=e'"${key.replace(
      /[']+/g,
      "''"
    )}"' AND list ILIKE e'%"${key.replace(
      /[']+/g,
      "''"
    )}"%' AND acronym IS NOT NULL AND acronym!='' ORDER BY occurrences DESC LIMIT 50`
    pool
      .query(queryString)
      .then((res) => {
        if (res.rows.length) {
          resolve(res.rows)
        } else {
          resolve(null)
        }
      })
      .catch((err) => {
        global.cconsole.error(err)
        resolve(null)
      })
  })
}
export const get_reverse_sources = function (key) {
  return new Promise(async (resolve) => {
    key = key.replace(/[']+/g, "''").toLowerCase()
    let queryString = `SELECT key, list_count, (length(sources) - length(replace(sources, e'"${key}"', '')) / length(e'"${key.replace(
      /[']+/g,
      "''"
    )}"')) AS occurrences FROM crawl.words WHERE list_count>1 AND key!=e'"${key.replace(
      /[']+/g,
      "''"
    )}"' AND sources ILIKE e'%"${key.replace(/[']+/g, "''")}"%' ORDER BY occurrences DESC LIMIT 50`
    pool
      .query(queryString)
      .then((res) => {
        if (res.rows.length) {
          resolve(res.rows)
        } else {
          resolve(null)
        }
      })
      .catch((err) => {
        global.cconsole.error(err)
        resolve(null)
      })
  })
}
export const get_words = function (offsetOrString, limit = 500) {
  let string = ""
  let offset = 0
  if (typeof offsetOrString === "number") {
    offset = offsetOrString
  } else if (typeof offsetOrString === "string") {
    string = offsetOrString
  }
  return new Promise(async (resolve) => {
    /*
     * Upgrade existing (crawled) rows:
     */
    // let where1 = `key='Americans'`;
    let where1 = `list_count IS NOT NULL AND list_count>=5 AND vrsn<4011`
    let orderby = `list_count DESC, timestamp DESC`
    let queryString =
      `SELECT * FROM crawl.words WHERE ` +
      (string ||
        ` ${where1} AND (sentiment IS NOT NULL OR sentiment IS NOT NULL) AND (error IS NULL OR error='') ORDER BY ${orderby} LIMIT ${limit}`)
    pool
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
export const get_words_to_rs = function () {
  return new Promise(async (resolve) => {
    // let queryString = `SELECT * FROM crawl.words WHERE vrsn<1038 AND (e_sentiment IS NOT NULL) ORDER BY list_count DESC, sources_count DESC LIMIT 100`; // OFFSET ${offset}
    let where1 = `(reverse_sources IS NOT NULL AND reverse_sources!='{}') AND rs_count IS NULL`
    let queryString = `SELECT * FROM crawl.words WHERE ${where1} ORDER BY rating DESC, word_count ASC LIMIT 500`

    pool
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
// export const get_word_nosentiment = function () {
//     return new Promise(async (resolve) => {
//         let queryString = `SELECT * FROM crawl.words WHERE attempts=100 AND version IS NULL OR version=7 LIMIT 1`; //attempts<2
//         pool.query(queryString)
//             .then((res) => {
//                 if (res.rows.length) {
//                     resolve(res.rows[0]);
//                 } else {
//                     resolve(null);
//                 }
//             })
//             .catch(() => {
//                 resolve(null);
//             });
//     });
// };
// export const get_word_nocorrection = function () {
//     return new Promise(async (resolve) => {
//         let queryString = `SELECT * FROM crawl.words WHERE attempts=100 AND version IS NULL OR version=7 LIMIT 1`; //attempts<2
//         pool.query(queryString)
//             .then((res) => {
//                 if (res.rows.length) {
//                     resolve(res.rows[0]);
//                 } else {
//                     resolve(null);
//                 }
//             })
//             .catch(() => {
//                 resolve(null);
//             });
//     });
// };
export const add_word = function (row) {
  return new Promise(async (resolve) => {
    // uncomment to disable:
    // resolve(false);

    // filter and validate inputs
    let { key, vrsn = null, rating = 0 } = row
    if (!key) {
      resolve("")
      return
    }
    key = key.replace(/[']+/g, "''").toLowerCase().trim()

    // count characters and spaces
    let char_count = key.length
    let words = key.split(" ")
    let word_count = words.length

    // PostgreSQL does not support INSERT IGNORE ?
    // So, manually SELECT, then INSERT if not found:
    try {
      // find existing row
      let queryString = `SELECT * FROM crawl.words WHERE key=e'${key}' LIMIT 1`
      let res: any = await pool.query(queryString)
      if (res && res.rows && res.rows.length) {
        // ignore
        resolve("")
        return
      }
    } catch (e) {
      // error
      global.cconsole.warn(e)
    }
    // add new row
    let queryString = `INSERT INTO crawl.words (key, attempts, vrsn, timestamp, char_count, word_count, rating) VALUES (e'${key}', 0, ${
      vrsn || null
    }, ${Date.now()}, ${char_count}, ${word_count}, ${rating})`
    pool
      .query(queryString)
      .then((res) => {
        let withRating = rating !== null && rating !== undefined ? `r "${rating}"` : ``
        global.cconsole.info(`added "${key}" ${withRating}`)
        resolve(key)
      })
      .catch((err) => {
        global.cconsole.warn(`tried to add "${key}"`)
        global.cconsole.error(err)
        resolve(err)
      })
  })
}
export const set_word = function (query) {
  return new Promise(async (resolve) => {
    // first, which key
    if (!query.key) {
      return
    }
    query.key = (query.key + "").replace(/[']+/g, "''")
    let key = query.key.toLowerCase().trim() // identifier WHERE key='thisKey'
    if (key !== query.key) {
      // if toLowerCase yields different value, then we have duplicate row!
      // choose best row, delete the other
      let lowercase_row: any = await get_word(key)
      let uppercase_row: any = await get_word(query.key, { keepCase: true })
      if (lowercase_row && uppercase_row) {
        // if conflict
        if (lowercase_row.list_count > uppercase_row.list_count) {
          global.cconsole.warn(["deleting uppercase", uppercase_row.key, "keeping lowercase", lowercase_row.key])
          await delete_word(uppercase_row.key) // delete UpperCase 'Key' row
          key = query.key = lowercase_row.key // keep lowercase key
        } else {
          global.cconsole.warn(["deleting lowercase", lowercase_row.key, "keeping uppercase", uppercase_row.key])
          await delete_word(lowercase_row.key) // delete lowercase 'key' row
          await pool.query(`UPDATE crawl.words SET key=e'${lowercase_row.key}' WHERE key=e'${uppercase_row.key}'`)
          key = query.key = lowercase_row.key // change key to lowercase {key:'thiskey'}
        }
      } else {
        // if no duplicate row
        global.cconsole.warn(["fixing case key", query.key, "to", key])
        await pool.query(`UPDATE crawl.words SET key=e'${key}' WHERE key=e'${query.key}'`)
        query.key = key // simply set the key of query to lowercase
      }
    }
    // then, execute query
    try {
      //
      // Assemble SQL "WHERE" string:
      // format each value
      let string = ""
      for (let prop in query) {
        // assemble the prop='value' pairs
        let value = query[prop]
        // value types allowed: number (no mod), string (escape), object (stringify+escape), undefined (null)
        if (typeof value === "number") {
          // number
        } else if (typeof value === "object") {
          if (value === null) {
            // if null, keep value null with no quotes
          } else {
            // object, array
            value = "e'" + JSON.stringify(value).replace(/[']+/g, "''") + "'"
            // temporary, debug: add line breaks, for readibility
            value = value.replace(/,{/g, ",\n\n{")
          }
        } else if (typeof value === "undefined") {
          // undefined = do not change in DB
          delete query[prop]
          continue
        } else if (typeof value === "string") {
          // string
          value = "e'" + value.replace(/[']+/g, "''").substring(0, 100) + "'"
        } else {
          // accidentally passed function or other unexpected type
          value = "e'" + value.toString().replace(/[']+/g, "''") + "'"
        }
        // replace backslash with double-backslash
        // if already double, it will stay doubled
        if (typeof value === "string") {
          value = value.replace(/[\\]+/g, "\\\\")
        }
        // record value
        string += `, ${prop}=${value}`
      }
      string = string.substr(2)
      //
      // Execute SQL
      let queryString = `UPDATE crawl.words SET ${string} WHERE key=e'${key}'`
      pool
        .query(queryString)
        .then(() => {
          resolve(true)
        })
        .catch((e) => {
          global.cconsole.warn(e)
          resolve(false)
        })
    } catch (e) {
      global.cconsole.error(e)
      resolve(false)
    }
  })
}
export const increment_word_attempts = function (key) {
  key = key.replace(/[']+/g, "''").toLowerCase()
  return new Promise(async (resolve) => {
    // resolve(false);
    // return;
    let queryString = `UPDATE crawl.words SET attempts = COALESCE(attempts, 0) + 1 WHERE key=e'${key}'`
    pool
      .query(queryString)
      .then(() => {
        resolve(true)
      })
      .catch((err) => {
        global.cconsole.error(err)
        resolve(false)
      })
  })
}

export const delete_word = function delete_word(key) {
  global.cconsole.error('deleting key = "' + key + '"')
  // do NOT transform key to lowercase
  key = key.replace(/[']+/g, "''")
  return new Promise(async (resolve) => {
    // resolve(false);
    // return;
    let queryString = `DELETE FROM crawl.words WHERE key=e'${key}'`
    pool
      .query(queryString)
      .then(() => {
        resolve(true)
      })
      .catch((e) => {
        global.cconsole.warn(e)
        resolve(false)
      })
  })
}
