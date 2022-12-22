import {
  data_word_delete,
  data_word_put,
  data_word_get_parsed,
  data_word_sentiment_of_synonym,
  data_word_proper_of_synonym,
  data_word_add_poswords,
  data_word_remove_words,
  data_word_add_to_others
} from "./pgdb"
import key_syns from "./promise/key_tlds"

export default [
  {
    path: "/api/data/domain_extensions/:key",
    method: "get",
    auth: ["captcha"],
    response: async function ({ req }) {
      try {
        return await key_syns(req.params.key)
      } catch (err) {
        return new Error(err)
      }
    }
  },
  {
    path: "/api/data/word/:key",
    method: "get",
    auth: ["captcha"],
    response: async function ({ req }) {
      try {
        return await data_word_get_parsed(req.params.key)
      } catch (err) {
        return new Error(err)
      }
    }
  },
  {
    path: "/api/data/word/:key",
    method: "delete",
    auth: ["captcha"],
    response: async function ({ req }) {
      try {
        return await data_word_delete(req.params.key)
      } catch (err) {
        return new Error(err)
      }
    }
  },
  {
    path: "/api/data/word/:key",
    method: "put",
    auth: ["captcha"],
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
  },
  {
    path: "/api/data/word_sentiment_of_synonym",
    method: "put",
    auth: ["captcha"],
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
  },
  {
    path: "/api/data/word_proper_of_synonym/:key/:synonym",
    method: "put",
    auth: ["captcha"],
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
  },
  {
    path: "/api/data/word_add_poswords",
    method: "put",
    auth: ["captcha"],
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
  },
  {
    path: "/api/data/word_remove_words",
    method: "put",
    auth: ["captcha"],
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
  },
  {
    path: "/api/data/word_add_to_others",
    method: "put",
    auth: ["captcha"],
    response: async function ({ req, res }) {
      const results = await data_word_add_to_others({
        word: req.body.word,
        pos: req.body.pos,
        addtoothers: req.body.addtoothers
      })
      if (results) {
        return results
      } else {
        res.status(400)
        return { error: `failed word row.key="${req.body.key}"` }
      }
    }
  }
]
