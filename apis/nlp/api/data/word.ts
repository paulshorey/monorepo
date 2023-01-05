import { data_word_delete, data_word_put, data_word_get_parsed } from "@ps/nlp/lib/data.words/promises/pgdb"

export default [
  {
    path: "/data/word/:key",
    method: "get",
    authFunctions: ["captcha"],
    response: async function ({ req }) {
      try {
        return await data_word_get_parsed(req.params.key)
      } catch (err) {
        return new Error(err)
      }
    }
  },
  {
    path: "/data/word/:key",
    method: "delete",
    authFunctions: ["captcha"],
    response: async function ({ req }) {
      try {
        return await data_word_delete(req.params.key)
      } catch (err) {
        return new Error(err)
      }
    }
  },
  {
    path: "/data/word/:key",
    method: "put",
    authFunctions: ["captcha"],
    response: async function ({ req, res }) {
      try {
        const results = await data_word_put(req.body, true)
        if (results) {
          return results
        } else {
          res.status(400)
          return { error: `failed word row.key="${req.body.key}"` }
        }
      } catch (err) {
        return new Error(err)
      }
    }
  }
]
