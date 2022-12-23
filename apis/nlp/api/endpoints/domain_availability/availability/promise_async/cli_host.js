import cli_host_many from "../../../domain_availability/availability/promise_many/cli_host"
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
export default async function (doms_arr) {
  // split up big list into multiple requests
  let requests = []
  for (let pagei = 0; pagei <= Math.floor(doms_arr.length / 20); pagei++) {
    requests.push(cli_host_many(doms_arr.slice(pagei * 20, (pagei + 1) * 20)))
  }
  // combine responses
  let doms_dict = {}
  let responses_arr = await Promise.all(requests)
  for (let dict of responses_arr) {
    for (let dom in dict) {
      if (dom) {
        doms_dict[dom] = dict[dom]
      }
    }
  }
  // debug
  if (DEBUG1) {
    global.cconsole.info("availability_whois", doms_dict)
  }
  //
  // await sleep(300)
  // return same format as was input
  return doms_dict
}
