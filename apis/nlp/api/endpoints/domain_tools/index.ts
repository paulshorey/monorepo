import cli_whois from "@ps/nlp/api/endpoints/domain_availability/availability/promise_one/cli_whois"

export default [
  {
    path: "/v1/whois",
    method: "get",
    auth: ["captcha"],
    response: async function ({ req }) {
      let results: any = { domain: req.query.domain, expiry: "", whois: "not found" }
      let doms_dict: any = await cli_whois(req.query.domain, { whois: true })
      if (doms_dict) {
        let data = doms_dict[results.domain]
        if (data) {
          results.expiry = data[2]
          results.whois = data[3]
        }
      }
      return results
    }
  }
]
