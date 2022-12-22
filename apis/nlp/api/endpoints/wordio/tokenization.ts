import spellcheck from "@ps/nlp/api/lib/words/spellcheck"
import wordbreak from "@ps/nlp/api/lib/words/wordbreak"
import spellcheck_wordbreak from "@ps/nlp/api/lib/words/spellcheck-wordbreak"
import spellcheck_wordbreak_wordchunk from "@ps/nlp/api/lib/words/spellcheck-wordbreak-wordchunk"
import wordchunk_tokenize from "@ps/nlp/api/lib/words/wordchunk-tokenize"

export default [
  {
    path: "/v1/spellcheck",
    method: "get",
    auth: ["captcha"],
    response: async function ({ req }) {
      return await spellcheck(req.query.str)
    }
  },
  {
    path: "/v1/wordbreak",
    method: "get",
    auth: ["captcha"],
    response: async function ({ req }) {
      return await wordbreak(req.query.str)
    }
  },
  {
    path: "/v1/spellcheck-wordbreak",
    method: "get",
    auth: ["captcha"],
    response: async function ({ req }) {
      return await spellcheck_wordbreak(req.query.str)
    }
  },
  {
    path: "/v1/spellcheck-wordbreak-wordchunk",
    method: "get",
    auth: ["captcha"],
    response: async function ({ req }) {
      return await spellcheck_wordbreak_wordchunk(req.query.str)
    }
  },
  {
    path: "/v1/wordbreak-wordchunk",
    method: "get",
    auth: ["captcha"],
    response: async function ({ req }) {
      return await spellcheck_wordbreak_wordchunk(req.query.str, { spellcheck: false })
    }
  },
  {
    path: "/v1/tokenize",
    method: "get",
    auth: ["captcha"],
    response: async function ({ req }) {
      let output: any = await spellcheck_wordbreak_wordchunk(req.query.str, { spellcheck: false })
      output = await wordchunk_tokenize(output)
      return output
    }
  },
  {
    path: "/v1/spellcheck-tokenize",
    method: "get",
    auth: ["captcha"],
    response: async function ({ req }) {
      let output: any = await spellcheck_wordbreak_wordchunk(req.query.str)
      output = await wordchunk_tokenize(output)
      return output
    }
  }
]
