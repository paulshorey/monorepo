import get_domains_availability from "@ps/nlp/lib/availability"
import aggregate_req_body_query from "@techytools/fn/io/req/aggregate_req_body_query_params"

export default [
  {
    path: "/v1/availability",
    method: "all",
    auth: ["captcha"],
    response: async function ({ req }) {
      // aggregate POST data and URL parameters
      let query = aggregate_req_body_query(req)
      if (query) {
        if (query.domains && typeof query.domains === "string") {
          query.domains = query.domains.split(",")
        }
      }
      // fixMe
      if (!query || !query.domains) {
        return { type: typeof query.domains, val: query.domains }
      }
      // get availability
      let results: any = await get_domains_availability(query)
      if (!query.show_metadata) {
        results = { status: results.status, note: results.note }
      }
      // return
      return results
    }
  }
]
