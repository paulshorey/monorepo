import domainr_many from "@ps/nlp/lib/availability/promise_many/domainr"
// import { sleep } from "@techytools/fn/io/promises"

// import import_localstorage from "node-localstorage"
// let { LocalStorage } = import_localstorage
// let localStorage = new LocalStorage("tmp/localStorage-whoisUndefined")

/**
 * CHECK DOMAIN AVAILABILITY @ whois
 * @param {array} doms_arr - list of domains to check
 *      key = domain name string, value = status code of availability
 * @returns {object} - key/value dict of {domain:status,}
 */
const DEBUG1 = false
export default async function (doms_arr, options) {
  // split up big list into multiple requests
  let requests = []
  for (let pagei = 0; pagei <= Math.floor(doms_arr.length / 10); pagei++) {
    let slice = doms_arr.slice(pagei * 10, (pagei + 1) * 10)
    if (slice.length) {
      requests.push(domainr_many(slice, options))
    }
  }
  // combine responses
  let output: any = {}
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
  // debug
  if (DEBUG1) {
    global.cconsole.info("availability_whois", output)
  }
  //
  // await sleep(300)
  // return same format as was input
  return output
}
