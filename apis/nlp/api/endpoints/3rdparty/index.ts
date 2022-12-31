import { dictionary_definition } from "./promises/oxford"

export default [
  {
    path: "/api/oxford/definition/:key",
    method: "get",
    auth: ["captcha"],
    response: async function ({ req }) {
      const results = await dictionary_definition(req.params.key)
      return results
    }
  }
]
