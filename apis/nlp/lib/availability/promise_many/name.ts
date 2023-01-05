import axios from "axios"

/**
 * CHECK DOMAIN AVAILABILITY @ name.com
 * @param {array} doms_arr - list of domains to check
 *      key = domain name string, value = status code of availability
 * @returns {object} - key/value dict of {domain:status,}
 */
let DEBUG1 = false
export default function (doms_arr, { DEBUG_TIME = false }: any = {}) {
  return new Promise((resolve) => {
    // debug time
    let time_start = Date.now()
    let time_debug = function (message: string | number = "") {
      if (DEBUG_TIME) {
        global.cconsole.log(
          "DEBUG_TIME (name) MANY (" + doms_arr.length + ")",
          ((Date.now() - time_start) / 1000).toFixed(3),
          message
        )
      }
    }
    // start
    let doms_dict: any = {}
    const MAX_DOMS = 50
    let doms_length = doms_arr.length
    if (!doms_length) {
      global.cconsole.warn("empty list of input doms gets empty list of results")
      resolve(doms_dict)
    }
    if (doms_length > MAX_DOMS) {
      global.cconsole.error("received too many domains. limiting to " + MAX_DOMS)
      doms_arr = doms_arr.slice(0, MAX_DOMS)
    }
    // request
    let url = "https://pshorey:2866070afd7b73fcebc0d8fb3f712b548e12924a@api.name.com/v4/domains:checkAvailability"
    let data: any = { domainNames: doms_arr }
    axios
      .post(url, data)
      .then((response) => {
        if (DEBUG1) global.cconsole.log(typeof response.data.results, response.data.results)
        // find dom in list, and modify its status
        for (let item of response.data.results) {
          // fix item.tld - sometimes contains sld
          if (item.sld.length === 2 && item.tld.includes(item.sld + ".")) {
            item.tld = item.tld.replace(item.sld + ".", "")
          }
          // record domain
          let dom = item.sld + "." + item.tld
          if (DEBUG1) global.cconsole.info(dom, item)
          if (item.purchasable && item.purchasePrice) {
            doms_dict[dom] = [item.purchasePrice < 10 ? 1 : item.purchasePrice || 1]
          } else {
            doms_dict[dom] = [10000001]
          }
        }
        if (DEBUG1) {
          global.cconsole.info("doms output", doms_dict)
        }
        time_debug(Object.keys(doms_dict).length)
        resolve(doms_dict)
      })
      .catch((error) => {
        time_debug("ERROR")
        resolve(error)
      })
  })
}
