import { data_word_sentiment_of_synonym } from "@ps/nlp/lib/pgdb/word"

export default [
  {
    path: "/v1/word_sentiment_of_synonym",
    method: "put",
    authFunctions: ["captcha"],
    response: async function ({ req, res }) {
      try {
        const results = await data_word_sentiment_of_synonym(req.body.key, req.body.synonym, req.body.sentiment)
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
