import get_domains_availability from "@ps/nlp/lib/availability"
import aggregate_req_body_query from "@techytools/fn/io/req/aggregate_req_body_query_params"

export default [
  {
    path: "/v1/domains/availability",
    method: "all",
    authFunctions: ["captcha"],
    response: async function ({ req }) {
      // aggregate POST data and URL parameters
      let query = aggregate_req_body_query(req)
      let query_domains = query.domains || query.str
      if (query_domains && typeof query_domains === "string") {
        query_domains = query_domains.split(",")
      }
      // fixMe
      if (!query || !query_domains) {
        return { type: typeof query_domains, val: query_domains }
      }
      // get availability
      let results: any = await get_domains_availability(query_domains, query.options)
      if (!query.show_metadata) {
        results = { status: results.status, note: results.note }
      }
      // return
      return results
    }
  }
]
