import key_syns from "@ps/nlp/lib/data.words/promise/key_tlds"

export default [
  {
    path: "/v1/domain/extensions",
    method: "get",
    authFunctions: ["captcha"],
    response: async function ({ req }) {
      try {
        return await key_syns(req.query.domain || req.query.str)
      } catch (err) {
        return new Error(err)
      }
    }
  }
]
