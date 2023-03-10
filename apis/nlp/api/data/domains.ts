import { data_domains_get_all } from "@ps/nlp/lib/pgdb/domain"
export default [
  {
    path: "/v1/domains",
    method: "get",
    auth: ["captcha"],
    response: async function () {
      const results = await data_domains_get_all("key,syns1,syns")
      return results
    }
  }
]
