import key_syns from "@ps/nlp/lib/words/promise/key_tlds"

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
  }
]
