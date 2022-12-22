import { data_domains_get_all } from "./pgdb"
import domain_key from "./promise/key" // get one domain (from key)
import domain_row_update from "./promise/row_update" // get row (from row), but update synonyms first
import domain_syns_of_syns from "./promise/key_syns_of_syns" // get dictionary of syns1:syns2

export default [
  {
    path: "/api/data/domain/:key",
    method: "get",
    auth: ["captcha"],
    response: async function ({ req }) {
      const results = await domain_key(req.params.key, { parse: false })
      return results
    }
  },
  {
    path: "/api/data/domains",
    method: "get",
    auth: ["captcha"],
    response: async function () {
      const results = await data_domains_get_all("key,syns1,syns")
      return results
    }
  },
  {
    path: "/api/data/domain_syns_of_syns/:key",
    method: "get",
    auth: ["captcha"],
    response: async function ({ req }) {
      const results = await domain_syns_of_syns(req.params.key)
      return results
    }
  },

  /**
   * PUT
   * update domain row - pass new row with any key/value pair
   * @params: key
   * @body: edited DB row: { key: '', syns1: [], syns2: [], }
   *    may be incomplete, but must include at least a "key" property
   * @response: {message: 'success'} or {error: 'failed'}
   */
  {
    path: "/api/data/domain/:key",
    method: "get",
    auth: ["captcha"],
    response: async function ({ res, req }) {
      let row: any = await domain_row_update(req.body)
      if (row && row.list_count) {
        return { message: `updated ${row.key}` }
      } else {
        res.status(400)
        return { error: true, message: `failed domain row.key="${req.body.key}"` }
      }
    }
  }
]
