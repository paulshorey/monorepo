/*
 * CHECK WHICH TLDS THE host COMMAND IS ABLE TO CHECK
 * 1) Check 3 long random strings for every TLD
 * 2) If all 3 come back as available, then this TLD is able to be reliably checked using CLI host command.
 */
import { sleep } from "pauls-pure-functions/functions/promises"
import "dotenv/config" // contains secret keys ~ never push to GIT!
import "common/global.js" // contains secret keys ~ never push to GIT!
import all_tlds from "@techytools/constants/data/domains/all"
import cli_whois from "@api/domain_availability/availability/promise_one/cli_whois"
// import cli_whois_many from "@api/domain_availability/availability/promise_many/cli_whois"
import { performance } from "perf_hooks"

import import_localstorage from "node-localstorage"
let { LocalStorage } = import_localstorage
let localStorageSupported = new LocalStorage("tmp/localStorage-supportedTLDs")
let localStorageUnsupported = new LocalStorage("tmp/localStorage-unsupportedTLDs")

const myArgs = process.argv.slice(2)
const tld = myArgs[0]
const slds = myArgs[1]
  ? [myArgs[1]]
  : ["example", "community", "register", "registry", "test", "local", "domain", "domains"]

let tlds = tld ? [tld] : false
let DEBUG1 = false
;(async function () {
  for (let tld of tlds || Object.keys(all_tlds)) {
    let time = performance.now()
    let unknown = []
    for (let sld of slds) {
      let dom = sld + "." + tld
      let whois: any = await cli_whois(dom)
      // log debug
      if (tlds.length === 1) {
        console.log(whois)
      }
      // log summary
    }
    let timeAvg = Math.round((performance.now() - time) / slds.length)
    if (unknown.length < slds.length / 4) {
      if (DEBUG1) console.info(tld, unknown)
      localStorageSupported.setItem(tld, timeAvg)
    } else {
      if (DEBUG1) console.warn(tld, unknown)
      localStorageUnsupported.setItem(tld, timeAvg)
    }

    // output
    await sleep(3)
  }
  process.exit()
})()
