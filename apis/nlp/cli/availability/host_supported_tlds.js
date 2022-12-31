/*
 * CHECK WHICH TLDS THE host COMMAND IS ABLE TO CHECK
 * 1) Check 3 long random strings for every TLD
 * 2) If all 3 come back as available, then this TLD is able to be reliably checked using CLI host command.
 */
// import sort_objects_by_property from "pauls-pure-functions/functions/sort_objects/sort_objects_by_property"
import "dotenv/config" // contains secret keys ~ never push to GIT!
import "common/global.js" // contains secret keys ~ never push to GIT!
import all_tlds from "@techytools/constants/data/domains/all"
import domainr_all from "@api/domains/availability/promise_async/domainr"
import host_many from "@api/domains/availability/promise_many/cli_host"
import whois_many from "@api/domains/availability/promise_many/cli_whois"
import check from "./test_words/100-4-14"

let label = function (code) {
  if (code === 501) code = 1
  if (code === 1501) code = 10000001
  if (code < 0) return "(((errored)))"
  else if (code === 0) return "((0))"
  else if (code > 10000000) return "not"
  else if (code > 0) return "(avail)"
}

;(async function () {
  for (let tld of Object.keys(all_tlds)) {
    let host_dict: any = await host_many([...check].map((sld) => sld + "." + tld))
    let domainr_dict: any = await domainr_all([...check].map((sld) => sld + "." + tld))
    let whois_dict: any = await whois_many([...check].map((sld) => sld + "." + tld))
    for (let sld of check) {
      let dom = sld + "." + tld
      let whois_code = (whois_dict[dom] || [])[0] || 0
      let host_code = (host_dict[dom] || [])[0] || 0
      let domainr_code = (domainr_dict[dom] || [])[0] || 0

      let max_ours = Math.max(whois_code, host_code) || 0
      let compare = ""
      if (label(max_ours) !== label(domainr_code)) {
        compare = `${label(max_ours)} vs. ${label(domainr_code)}   ...   `
        global.cconsole.info(dom, compare, domainr_dict[dom])
      }
    }
    console.log(tld + " ok\n")
  }
})()
