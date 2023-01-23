import { data_word_remove_words } from "@ps/nlp/lib/pgdb/word"
export default [
  {
    path: "/v1/word_remove_words",
    method: "put",
    authFunctions: ["captcha"],
    response: async function ({ req, res }) {
      try {
        const results = await data_word_remove_words({ key: req.body.key, words: req.body.words })
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
