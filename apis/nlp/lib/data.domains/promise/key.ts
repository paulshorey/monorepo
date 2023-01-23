/*
 * Dependencies
 */
import { data_domain_get, data_domain_get_parsed } from "@ps/nlp/lib/pgdb/domain"

/**
 * Get DB row
 * @param key {string} - domain extension
 * @param options {object}
 * @param options.parse {boolean} - default true. If false, will return content stringified, directly from database
 * @resolves row {object} - full DB row {key, rank, syns1, etc}
 */
export default function (key, { parse = true }) {
  return new Promise(async (resolve) => {
    /*
     * Get row
     */
    let row
    if (parse) {
      row = await data_domain_get_parsed(key, "key,syns,syns1")
    } else {
      row = await data_domain_get(key, "key,syns,syns1")
    }

    /*
     * Done
     */
    resolve(row)
  })
}
