/*
 * Dependencies
 */
import { Pool } from "pg"
import customEnv from "custom-env"
customEnv.env("local")
customEnv.env()
const pool = new Pool()
// execute shell
import import_child_process from "child_process"
const exec = import_child_process.exec
const execute = function (command, callback) {
  exec(command, function (error, stdout) {
    if (callback) {
      callback(stdout)
    }
  })
}
/*
 * Logging
 */
const LOG = true
if (LOG) {
  process.on("uncaughtException", (err) => {
    execute("pm2 stop all")
  })
}
/**************************************************************************************************
 * FUNCTIONS
 ****************************************************/
/**
 * PGDB sites.memidex: Get row column value "html"
 * @param key {string}
 * @resolves html {string}
 */
export const get_memidex_html = function get_memidex_html(key) {
  return new Promise(async (resolve) => {
    let queryString = `SELECT * FROM sites.memidex WHERE key=e'${key.replace(/[']+/g, "''")}'`
    pool
      .query(queryString)
      .then((res) => {
        if (res.rows && res.rows[0] && res.rows[0].html) {
          resolve(res.rows[0].html)
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
/**
 * PGDB sites.memidex: Add or Edit row
 * @param row {object} - object keys/values will be converted to SQL UPDATE string
 * @param row.key {string}
 * @param row.html {string}
 * @resolves success {boolean}
 */
export const set_memidex = function set_memidex(row) {
  // filter and validate inputs
  let { key } = row
  if (!key) {
    return
  }
  key = key.replace(/[']+/g, "''")
  // ok
  return new Promise(async (resolve) => {
    // INSERT
    try {
      await pool.query(`INSERT INTO sites.memidex (key) VALUES (e'${key}')`)
    } catch (e) {}
    // UPDATE
    let ok = await update_memidex(row)
    if (ok) {
      resolve(true)
    } else {
      if (LOG) global.cconsole.error(`FAILED TO UPDATE DOM "${key}"`)
      resolve(false)
    }
  })
}
/**
 * PGDB sites.memidex: Save row
 * @param row {object} - row object key/value pairs will be converted to SQL UPDATE string
 * @resolves success {boolean}
 */
export const update_memidex = function update_memidex(row) {
  return new Promise(async (resolve) => {
    // key property required
    let { key } = row
    if (!row.key) {
      resolve(false)
      return
    }
    key = key.replace(/[']+/g, "''")
    try {
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
          // undefined
          value = null
        } else if (typeof value === "string") {
          // string
          value = "e'" + value.replace(/[']+/g, "''") + "'"
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
        string += `, ${col}=${value}`
      }
      string = string.substr(2)
      //
      // Execute SQL
      let queryString = `UPDATE sites.memidex SET ${string} WHERE key=e'${key}'`
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
