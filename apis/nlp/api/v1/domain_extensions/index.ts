import key_syns from "@ps/nlp/lib/data.words/promise/key_tlds"

export default [
  {
    path: "/v1/domain_extensions/:key",
    method: "get",
    authFunctions: ["captcha"],
    response: async function ({ req }) {
      try {
        return await key_syns(req.params.key)
      } catch (err) {
        return new Error(err)
      }
    }
  }
]
