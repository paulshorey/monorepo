/*
 * Dependencies
 */
import import_pg from "pg"
import json_parse from "@techytools/fn/io/json/json_parse"
import objects_merge from "@techytools/fn/io/objects/objects_merge_keys"
import sort_objects_by_property from "@techytools/fn/io/sort_objects/sort_objects_by_property"
import { performance } from "perf_hooks"
import customEnv from "custom-env"

customEnv.env("local")
customEnv.env()
const { Pool } = import_pg
const pool = new Pool()

let DEBUG_TIME = false
let debug_time_since
let debug_time = function (message) {
  let time = performance.now()
  if (debug_time_since && message) {
    global.cconsole.log(`DEBUG_TIME ${message} = `, Math.round((time - debug_time_since) / 10) / 100)
  }
  debug_time_since = time
}

/*
 * Mod
 */
const domains_row_model = {
  key: "",
  restrictions: null,
  rank: 0,
  syns1: "[]",
  syns2: "[]",
  syns3: "[]",
  syns4: "[]"
}

/*
 * Debug
 */
let DEBUG1 = false
let DEBUG2 = false

/**************************************************************************************************
 * FUNCTIONS
 ****************************************************/

export const data_domain_syns4 = function (key) {
  return new Promise(async (resolve) => {
    let queryString = `SELECT key FROM data.domains WHERE syns4 ILIKE e'%"${key.replace(
      /[']+/g,
      "''"
    )}"%' ORDER BY rank DESC`
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

export const data_domain_syns3 = function (key) {
  return new Promise(async (resolve) => {
    if (DEBUG_TIME) debug_time("")
    let queryString = `SELECT key FROM data.domains WHERE syns3 ILIKE e'%"${key.replace(
      /[']+/g,
      "''"
    )}"%' ORDER BY rank DESC`
    pool
      .query(queryString)
      .then((res) => {
        if (DEBUG_TIME) debug_time("data_domain_syns3")
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

export const data_domain_syns2 = function (key) {
  return new Promise(async (resolve) => {
    if (DEBUG_TIME) debug_time("")
    let queryString = `SELECT key FROM data.domains WHERE syns2 ILIKE e'%"${key.replace(
      /[']+/g,
      "''"
    )}"%' ORDER BY rank DESC`
    pool
      .query(queryString)
      .then((res) => {
        if (DEBUG_TIME) debug_time("data_domain_syns2")
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

export const data_domain_syns1 = function (key) {
  return new Promise(async (resolve) => {
    if (DEBUG_TIME) debug_time("")
    let queryString = `SELECT key FROM data.domains WHERE syns1 ILIKE e'%"${key.replace(
      /[']+/g,
      "''"
    )}"%' OR syns ILIKE e'%"${key.replace(/[']+/g, "''")}"%' ORDER BY rank DESC`
    pool
      .query(queryString)
      .then((res) => {
        if (DEBUG_TIME) debug_time("data_domain_syns1")
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

export const data_domains_get = function (columns, where = "") {
  let selectWhat = "*"
  if (columns) {
    selectWhat = columns.toString()
  }
  return new Promise(async (resolve) => {
    let queryString = `SELECT ${selectWhat} FROM data.domains ${where}`
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
export const data_domains_get_parsed = function (columns, where = "") {
  return new Promise(async (resolve) => {
    let rows: any = await data_domains_get(columns, where)
    if (!rows || !rows.length) {
      resolve([])
    }
    for (let row of rows) {
      for (let prop in row) {
        row[prop] = json_parse(row[prop])
      }
    }
    resolve(rows)
  })
}

export const data_domains_get_all = function (columns) {
  let selectWhat = "*"
  if (columns) {
    selectWhat = columns.toString()
  }
  return new Promise(async (resolve) => {
    let queryString = `SELECT ${selectWhat} FROM data.domains`
    pool
      .query(queryString)
      .then((res) => {
        if (res.rows.length) {
          // sort
          for (let row of res.rows) {
            row.syns1_count = row.syns1 ? JSON.parse(row.syns1).length : 0
          }
          res.rows = sort_objects_by_property(res.rows, "syns1_count")
          // return
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

export const data_domain_get = function (key, columns?: string | string[]) {
  let selectWhat = "*"
  if (columns) {
    selectWhat = columns.toString()
  }
  return new Promise(async (resolve) => {
    let queryString = `SELECT ${selectWhat} FROM data.domains WHERE key=e'${key.replace(/[']+/g, "''")}'`
    pool
      .query(queryString)
      .then((res) => {
        if (res.rows[0] && typeof res.rows[0] === "object") {
          resolve(objects_merge(domains_row_model, res.rows[0]))
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

export const data_domain_get_parsed = function (key, columns?: string | string[]) {
  return new Promise(async (resolve) => {
    let row: any = await data_domain_get(key, columns)
    if (!row || typeof row !== "object") {
      global.cconsole.log("!row")
      resolve(null)
      return
    }
    for (let prop in row) {
      row[prop] = json_parse(row[prop])
    }
    resolve(row)
  })
}

export const data_domain_add = function (key) {
  // filter and validate inputs
  key = key.replace(/[']+/g, "''")
  // ok
  return new Promise(async (resolve) => {
    try {
      let queryString = `INSERT INTO data.domains (key) VALUES (e'${key}')`
      if (DEBUG1) global.cconsole.log(queryString)
      await pool.query(queryString)
      resolve(true)
    } catch (e) {
      global.cconsole.error(e)
      resolve(false)
    }
  })
}

export const data_domain_put = function (row) {
  if (DEBUG1) global.cconsole.log("data_word_put", row)
  if (DEBUG2) global.cconsole.log("data_word_put", [row.key])
  return new Promise(async (resolve) => {
    // filter and validate inputs
    let { key } = row
    if (!row.key) {
      resolve(false)
      return
    }
    key = key.replace(/[']+/g, "''")

    // add if not exist
    let existing: any = await data_domain_get(key, ["key"])
    if (!existing) {
      await data_domain_add(key)
    }

    // then update
    try {
      //
      // Assemble SQL "WHERE" string:
      // format each value
      let string = ""
      for (let col in row) {
        // assemble the col='value' pairs
        let value = row[col]
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
          delete row[col]
          continue
        } else if (typeof value === "string") {
          // string
          value = "e'" + value.replace(/[']+/g, "''").replace(/(\r\n|\n|\r)/gm, " ") + "'"
        } else {
          // accidentally passed function or other unexpected type
          value = "e'" + value.toString().replace(/[']+/g, "''") + "'"
        }
        // replace backslash with double-backslash
        // if already double, it will stay doubled
        if (typeof value === "string") {
          value = value.replace(/[\\]+/g, "\\\\")
        }
        // sanitize value (domains only)
        // allow stringified arrays ["",]
        if (typeof value === "string") {
          value = value
            .toLowerCase()
            .replace(/_/g, " ")
            .replace(/[^\w [",]]+/g, "")
            .toLowerCase()
            .trim()
        }
        // record value
        string += `, ${col}=${value}`
      }
      string = string.substr(2)
      //
      // Execute SQL
      let queryString = `UPDATE data.domains SET ${string} WHERE key=e'${key}'`
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
