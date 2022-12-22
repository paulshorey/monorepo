import get_domains_suggestions from "./suggestions/index"
import chunk_string from "@ps/nlp/api/lib/words/chunk_string"
import aggregate_req_body_query from "@ps/fn/io/req/aggregate_req_body_query_params"

export default [
  {
    path: "/v1/suggestions-mock",
    method: "all",
    auth: ["captcha"],
    response: async function () {
      return {}
    }
  },
  {
    path: "/v1/suggestions",
    method: "all",
    auth: ["captcha"],
    response: async function ({ res, req }) {
      let query = aggregate_req_body_query(req) // aggregate POST data and URL inputs
      // backwards compatibility
      if (!query.str && query.domain) {
        query.str = query.domain
        delete query.domain
      }
      // parse
      if (query) {
        if (query.tlds_use && typeof query.tlds_use === "string") {
          query.tlds_use = query.tlds_use.split(",")
        }
        if (query.tlds_ignore && typeof query.tlds_ignore === "string") {
          query.tlds_ignore = query.tlds_ignore.split(",")
        }
      }
      // input str
      let input_str = query.domain || query.str || "" // required
      if (input_str.length < 2) {
        let err = "domain or keyword str not specified"
        res.status(500)
        return err
      }
      // input tld
      let input_tlds_user = query.tld ? [query.tld] : query.tlds_use || ["com"] // default value
      /*
       * prepare response
       */
      let response: any = {}
      /*
       * VALIDATE INPUTS
       */
      if (input_str === "test_fail") throw new Error("test failed on purpose - hello_worl")
      // default value (should never be empty!)
      if (!input_str) {
        input_str = "best domain names"
      }
      // default value
      if (!input_tlds_user.length) {
        input_tlds_user.push("com")
      } else if (input_tlds_user[0] === "") {
        input_tlds_user = ["com"]
      }
      /*
       * CHUNK STRING
       */
      const chunks: any = await chunk_string(input_str, input_tlds_user[0], !!query.spell_check)
      response.string_original = chunks.string_original.toLowerCase()
      response.string = chunks.string.toLowerCase()
      response.tld = chunks ? chunks.tld : ""
      // dashes
      if (chunks.options.string_includes_dashes) {
        response.string = chunks.string.replace(/ /g, "-")
        query.use_dashes = chunks.options.string_includes_dashes
      }
      /*
       * GENERATE SUGGESTIONS
       */
      let results: any = await get_domains_suggestions(
        response.string_original,
        response.string,
        response.tld,
        chunks.chunks_keys,
        chunks.chunks_rows,
        query,
        input_tlds_user || [],
        query.tlds_ignore || [],
        chunks.bing_alts || []
      )
      global.cconsole.log("results", results)
      /*
       * RESPONSE
       */
      if (!response.tld) {
        response.tld = results.tlds[0]
      }
      response = {
        ...response,
        ...results
      }
      // Temporary
      response.domains = response.domains_lists
      delete response.domains_lists
      //
      // if (!global.host_is_dev && !req.headers["experimental"]) {
      //   // Production
      //   // delete response.tlds_extra
      //   // delete response.phrases
      //   // delete response.phrase_lists
      //   // delete response.word_hacks
      //   // delete response.com_hacks
      //   // delete response.phrase_hacks
      //   // delete response.is_name
      //   // delete response.is_tech
      //   // delete response.is_brand
      //   // delete response.is_about_nou
      //   // delete response.is_about_ver
      // } else {
      //   // Development
      //   // Simplify phrases
      //   if (response.phrases) {
      //     response.phrases = response.phrases.map((obj) => obj.string)
      //   }
      // }
      /*
       * RETURN
       */
      return response
    }
  }
]
