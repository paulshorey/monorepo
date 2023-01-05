import check_domainr from "./promise_async/domainr"
// import check_name from "../../domain_availability/availability/promise_many/name"
// import check_moi from "../../domain_availability/availability/promise_many/moi"
import check_cli_host from "./promise_many/cli_host"
// import check_whoisxmlapi from "../../domain_availability/availability/promise_many/whoisxmlapi"
import check_cli_whois from "./promise_many/cli_whois"
// import tlds_name from "@techytools/constants/data/domains/availability/donuts"
// import tlds_whoisxmlapi from "@techytools/constants/data/domains/availability/whoisxmlapi"
// import is_number from "@techytools/fn/io/num/is_number"
// import { data_word_get } from "../../data.words/pgdb"

import import_localstorage from "node-localstorage"
let { LocalStorage } = import_localstorage
let localStorage = new LocalStorage("tmp/localStorage-domainsAvailability")
// localStorage = {
//   getItem: function () {},
//   setItem: function () {}
// }

/**
 * CHECK DOMAIN AVAILABILITY
 * @param {object} domains - list of domains to check
 *      Key is full domain name {string}.
 *      Value is status {number}.
 * @returns {object} - modified key/value dict, from input list of domains
 */
let DEBUG1 = false // reminder of how this works, what happens when
let DEBUG2 = false // something broken, find the spot
let DEBUG_TIME = false
let USE_CACHE = true
const availability = async function ({ domains = [], options }: any) {
  if (!options) options = {}
  // debug time
  let time_start = Date.now()
  let time_debug = function (message: string | number = "") {
    if (DEBUG_TIME) {
      global.cconsole.info("DEBUG_TIME /availability_one", ((Date.now() - time_start) / 1000).toFixed(3), message)
    }
  }
  if (!("use_alt_source" in options)) {
    options.use_alt_source = options.not_ping || false
  }

  /*
   * OUTPUT
   */
  let output: any = { status: {}, note: {} }
  let i_skip = 0

  /*
   * BUCKETS
   */
  let b_name = []
  let b_moi = []
  let b_domainr = []
  let b_cli_whois = []
  let b_cli_host = []
  let b_whoisxmlapi = []
  let requests = []

  /*
   * DOMAINS -> into BUCKETS
   */
  let n_from_localstorage = 0
  for (let domname of domains) {
    if (domname.length < 5) continue
    let domlen = domname.indexOf(".")
    if (domlen === -1) {
      throw new Error("wtf domlen===-1")
    }
    let domext = domname.substr(domname.indexOf(".") + 1)
    let domsld = domname.substring(0, domname.indexOf("."))
    if (!domsld) continue

    /*
     * MAGIC
     */
    if (
      domname === "vaccineword.com" ||
      domname === "bestdomain.name" ||
      domname === "besta.domains" ||
      domname === "besta.name" ||
      domname === "besta.app" ||
      domname === "besta.tech"
    ) {
      output.status[domname] = 1
      output.note[domname] = "owned by besta.domains"
      continue
    }

    /*
     * ASSUME UNAVAILABLE (too short, too good)
     */
    // if (domsld.length < 9 && domext === "com") {
    //   let row: any = await data_word_get(domsld,'list_count')
    //   if (row && row.list_count>15) {
    //     output.status[domname] = 10000001
    //   }
    //   continue
    // }

    /*
     * GET FROM LOCALSTORAGE (value can be zero)
     */
    if (USE_CACHE) {
      let code = localStorage.getItem(domname + "status" + options.use_alt_source)
      if (code) {
        code = Number(code) || 0
        if (code > 0) {
          // use from localstorage
          n_from_localstorage++
          output.status[domname] = code
          // // check for nameserver info
          // let ns = localStorage.getItem(domname + options.use_alt_source + "-ns")
          // if (ns) {
          //   output.ns[domname] = ns
          // }
          continue
        }
      }
    }

    /*
     * FILL BUCKETS
     */
    // first, set value as 0 in case the availability API request goes out, but does not come back, it will be ignored
    output.status[domname] = 0

    // secrets
    if (domsld === "secretlyclearcache") {
      global.cconsole.warn("localStorage.clear()")
      localStorage.clear()
      let row: any = {
        subject: "secretlyclearcache.com",
        email: "paul@besta.domains",
        name: "availability",
        text: "clear cache availability() IP: " + global.HOSTNAME + " " + (global["DEVELOPMENT"] ? "DEVELOPMENT" : ""),
        date: new Date()
      }
    }
    // too short, invalid
    else if (domlen < 3) {
      output.status[domname] = 1
      output.note[domname] = "invalid"
    }
    // fill moi
    // else if (domext === "moi") {
    //   b_moi.push(domname)
    // }
    // fill name.com
    // else if (tlds_name[domext]) {
    //   b_name.push(domname)
    // }
    // // fill cli_host
    // else if (domext==='com.fr' || domext==='net.nl') {
    //   b_cli_host.push(domname)
    // }
    // // fill cli_whois
    // else if (domext==='com.fr' || domext==='net.nl') {
    //   b_cli_whois.push(domname)
    // }
    // fill domainr
    else {
      b_domainr.push(domname)
    }

    /*
     * GET RESULTS
     */
    // dump b_name bucket (is full)
    // if (b_name.length === 50) {
    //   if (DEBUG1) global.cconsole.log("fill bucket name", 50, b_name)
    //   requests.push(check_name(b_name, { DEBUG_TIME }))
    //   b_name = [] // start over - empty
    // }
    // dump b_domainr bucket (is full)
    if (b_domainr.length === 50) {
      if (DEBUG1) global.cconsole.log("fill bucket domainr", 50, b_domainr)
      requests.push(check_domainr(b_domainr, { DEBUG_TIME }))
      b_domainr = [] // start over - empty
    }
  }
  // dump remaining content in bucket (what's left after last, full dump)
  {
    let len = b_cli_host.length
    if (len) {
      if (DEBUG1) global.cconsole.log("fill bucket cli_host", len)
      requests.push(check_cli_host(b_cli_host, { DEBUG_TIME }))
    }
  }
  // {
  //   let len = b_name.length
  //   if (len) {
  //     if (DEBUG1) global.cconsole.log("fill bucket name", len)
  //     requests.push(check_name(b_name, { DEBUG_TIME }))
  //   }
  // }
  {
    let len = check_cli_host.length
    if (len) {
      if (DEBUG1) global.cconsole.log("fill bucket cli_host", len)
      requests.push(check_cli_host(b_cli_host, { DEBUG_TIME }))
    }
  }
  {
    let len = check_cli_whois.length
    if (len) {
      if (DEBUG1) global.cconsole.log("fill bucket cli_whois", len)
      requests.push(check_cli_whois(b_cli_whois, { DEBUG_TIME }))
    }
  }
  {
    let len = b_domainr.length
    if (len) {
      if (DEBUG1) global.cconsole.log("fill bucket domainr", len)
      requests.push(check_domainr(b_domainr, { DEBUG_TIME }))
    }
  }

  /*
   * READ RESPONSES
   */
  let responses: any = await Promise.all(requests)
  for (let response of responses) {
    // aggregate datas
    for (let type in response) {
      let dict = response[type]
      if (dict) {
        output[type] = { ...(output[type] || {}), ...dict }
      }
    }
  }
  time_debug("got all Promise.all " + Object.keys(output.status).length)

  /*
   * CACHE
   */
  if (output.status && typeof output.status === "object") {
    for (let domstr in output.status) {
      localStorage.setItem(domstr + "status" + options.method, output.status[domstr])
    }
  }

  /*
   * LOG
   */
  if (DEBUG1) global.cconsole.log("n_from_localstorage", n_from_localstorage)

  /*
   * OK
   */
  i_skip++
  return output
}
export default availability
