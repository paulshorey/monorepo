import spellcheck from "@ps/nlp/lib/words/spellcheck"
import wordbreak from "@ps/nlp/lib/words/wordbreak"
import spellcheck_wordbreak from "@ps/nlp/lib/words/spellcheck-wordbreak"
import spellcheck_wordbreak_wordchunk from "@ps/nlp/lib/words/spellcheck-wordbreak-wordchunk"
import wordchunk_tokenize from "@ps/nlp/lib/words/wordchunk-tokenize"

export default [
  {
    path: "/v1/string/spellcheck",
    method: "get",
    authFunctions: ["captcha"],
    response: async function ({ req }) {
      return await spellcheck(req.query.str)
    }
  },
  {
    path: "/v1/string/break",
    method: "get",
    authFunctions: ["captcha"],
    response: async function ({ req }) {
      return await wordbreak(req.query.str)
    }
  },
  {
    path: "/v1/string/spellcheck-break",
    method: "get",
    authFunctions: ["captcha"],
    response: async function ({ req }) {
      return await spellcheck_wordbreak(req.query.str)
    }
  },
  {
    path: "/v1/string/spellcheck-break-chunk",
    method: "get",
    authFunctions: ["captcha"],
    response: async function ({ req }) {
      return await spellcheck_wordbreak_wordchunk(req.query.str)
    }
  },
  {
    path: "/v1/string/break-chunk",
    method: "get",
    authFunctions: ["captcha"],
    response: async function ({ req }) {
      return await spellcheck_wordbreak_wordchunk(req.query.str, { spellcheck: false })
    }
  },
  {
    path: "/v1/string/tokenize",
    method: "get",
    authFunctions: ["captcha"],
    response: async function ({ req }) {
      let output: any = await spellcheck_wordbreak_wordchunk(req.query.str, { spellcheck: false })
      output = await wordchunk_tokenize(output)
      return output
    }
  },
  {
    path: "/v1/string/spellcheck-tokenize",
    method: "get",
    authFunctions: ["captcha"],
    response: async function ({ req }) {
      let output: any = await spellcheck_wordbreak_wordchunk(req.query.str)
      output = await wordchunk_tokenize(output)
      return output
    }
  }
]
