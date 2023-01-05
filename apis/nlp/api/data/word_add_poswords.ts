import { data_word_add_poswords } from "@ps/nlp/lib/data.words/promises/pgdb"

export default [
  {
    path: "/v1/word_add_poswords",
    method: "put",
    authFunctions: ["captcha"],
    response: async function ({ req, res }) {
      try {
        const results = await data_word_add_poswords({
          key: req.body.key,
          pos: req.body.pos,
          poswords: req.body.poswords
        })
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
