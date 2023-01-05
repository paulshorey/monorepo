import domain_key from "@ps/nlp/lib/data.domains/promise/key" // get one domain (from key)
import domain_row_update from "@ps/nlp/lib/data.domains/promise/row_update" // get row (from row), but update synonyms first

export default [
  /**
   * GET
   */
  {
    path: "/v1/domain/:key",
    method: "get",
    auth: ["captcha"],
    response: async function ({ req }) {
      const results = await domain_key(req.params.key, { parse: false })
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
    path: "/v1/domain/:key",
    method: "put",
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
