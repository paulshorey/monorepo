import { data_word_proper_of_synonym } from "@ps/nlp/lib/data.words/promises/pgdb"
export default [
  {
    path: "/v1/word_proper_of_synonym/:key/:synonym",
    method: "put",
    authFunctions: ["captcha"],
    response: async function ({ req, res }) {
      try {
        const results = await data_word_proper_of_synonym(req.params.key, req.params.synonym, req.body.proper)
        if (results) {
          return results
        } else {
          res.status(400)
          return { error: `failed word row.key="${req.params.key}"` }
        }
      } catch (err) {
        return new Error(err)
      }
    }
  }
]
