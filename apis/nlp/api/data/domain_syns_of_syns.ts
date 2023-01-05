import domain_syns_of_syns from "@ps/nlp/lib/data.domains/promise/key_syns_of_syns"
export default [
  {
    path: "/v1/domain_syns_of_syns/:key",
    method: "get",
    auth: ["captcha"],
    response: async function ({ req }) {
      const results = await domain_syns_of_syns(req.params.key)
      return results
    }
  }
]
