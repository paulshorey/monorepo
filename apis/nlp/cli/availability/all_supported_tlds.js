/*
 * CHECK WHICH TLDS THE host COMMAND IS ABLE TO CHECK
 * 1) Check 3 long random strings for every TLD
 * 2) If all 3 come back as available, then this TLD is able to be reliably checked using CLI host command.
 */
import { sleep } from "pauls-pure-functions/functions/promises"
import "dotenv/config" // contains secret keys ~ never push to GIT!
import "common/global.js" // contains secret keys ~ never push to GIT!
import tlds_all from "@techytools/constants/data/domains/all"
import tlds_name from "@techytools/constants/data/domains/availability/name"
import many_domainr from "@api/domains/availability/promise_many/domainr"
import many_name from "@api/domains/availability/promise_many/name"
import one_domainr from "@api/domains/availability/promise_one/domainr"
import one_name from "@api/domains/availability/promise_one/name"
import many_whois from "@api/domains/availability/promise_many/cli_whois"
import many_host from "@api/domains/availability/promise_many/cli_host"
import one_host from "@api/domains/availability/promise_one/cli_host"
import { performance } from "perf_hooks"

const myArgs = process.argv.slice(2)
const tld = myArgs[0]
const slds = myArgs[1]
  ? [myArgs[1]]
  : ["test", "register", "best", "travelto", "bestof", "go2", "community", "today", "bestof", "interesting"]

let tlds = tld ? [tld] : Object.keys(tlds_all)
let DEBUG1 = false
let results: any = {}
;(async function () {
  for (let tld of tlds) {
    // wrapper for all sources
    let res = ((results[tld]: any) = {})
    let doms = [...slds].map((dom) => dom + "." + tld)
    let problem_doms: any = {}
    let available_doms: any = {}
    let correct_doms: any = {}
    // {
    //   // name
    //   res.name = {}
    //   if (tlds_name[tld]) {
    //     let time = performance.now()
    //     res.name = (await many_name(doms)) || []
    //     res.name_time = Math.round((performance.now() - time) / doms.length)
    //     // console.log(res.name)
    //     // global.cconsole.warn("name " + res.name_time, "\n")
    //   }
    // }
    // {
    //   // domainr
    //   res.domainr = {}
    //   let time = performance.now()
    //   res.domainr = (await many_domainr(doms)) || []
    //   res.domainr_time = Math.round((performance.now() - time) / doms.length)
    //   // global.cconsole.warn("domainr " + res.domainr_time, "\n")
    //   // console.log(res.domainr)
    // }
    {
      // whois
      res.whois = {}
      let time = performance.now()
      res.whois = (await many_whois(doms)) || {}
      res.whois_time = Math.round((performance.now() - time) / doms.length)
      let success = 0
      let failed = 0
      let available: any = {}
      let problem: any = {}
      for (let dom of doms) {
        let code = res.whois[dom] ? res.whois[dom][0] : -2
        if (code < 1) {
          // COMPARE to real status
          let actual_dict = tlds_name[dom] ? await one_name(dom) : await one_domainr(dom)
          let actual_code = actual_dict[dom] ? actual_dict[dom][0] : -3
          let actual_status = actual_dict[dom] ? actual_dict[dom][1] + "" + actual_dict[dom][2] : ""
          if (actual_code > 0 && actual_code < 10000000) {
            // is available, so OK to assume it's available
            // console.log('"' + dom + '" is available $' + code)
            available[dom] = [actual_code, actual_status]
            success++
          } else if (code < 1) {
            // domainr errored, so OK to use whois, because others are not any better
            // console.log(dom + " !!! @@@ !!! ERROR !!! @@@ !!!")
            success++
          } else if (code > 10000000) {
            // not available, CHECK cli_host
            let host_dict: any = await one_host(dom)
            if (host_dict && host_dict[dom]) {
              code = host_dict[dom][0] || code
            }
            if (code > 0 && code < 10000000) {
              available[dom] = [code, status]
              success++
            } else if (code > 10000000) {
              // still not available! not safe to use
              console.log("!host", host_dict)
              problem[dom] = [code, status]
              failed++
            }
          }
        } else {
          // WHOIS found record
          success++
        }
      }
      console.log("problem", problem)
      // if (available.length) {
      //   console.log("?????????", available)
      // }
      // if (problem.length) {
      //   console.log("!!!!!!!!!", problem)
      // }
      let tldfixed = tld + new Array(15 - tld.length).join(" ")
      if (!failed) {
        global.cconsole.info(
          "." + tldfixed + "" + success + " ok          " + failed + " bad        ",
          res.whois_time,
          "\n"
        )
      } else if (failed <= Math.round(slds.length / 3)) {
        global.cconsole.warn(
          "." + tldfixed + "" + success + " ok          " + failed + " bad        ",
          res.whois_time,
          "\n"
        )
      } else {
        global.cconsole.error(
          "." + tldfixed + "" + success + " ok          " + failed + " bad        ",
          res.whois_time,
          "\n"
        )
      }
    }
    {
      // // host
      // res.host = {}
      // let time = performance.now()
      // res.host = (await many_host(doms)) || []
      // res.host_time = Math.round((performance.now() - time) / doms.length)
      // console.log(res.host)
      // global.cconsole.warn("host " + res.host_time, "\n")
    }
    // let timeAvg = Math.round((performance.now() - time) / slds.length)
    // if (unknown.length < slds.length / 4) {
    //   if (DEBUG1) console.info(tld, unknown)
    //   localStorageSupported.setItem(tld, timeAvg)
    // } else {
    //   if (DEBUG1) console.warn(tld, unknown)
    //   localStorageUnsupported.setItem(tld, timeAvg)
    // }

    // output
    await sleep(3)
  }
  process.exit()
})()
