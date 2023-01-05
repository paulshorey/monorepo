import axios from "axios"

/**
 * CHECK DOMAIN AVAILABILITY @ moi
 * @param {object} doms_dict - key/value list of domains
 *      Key is full domain name {string}.
 *      Value is status {number}: 0=unknown, 1=normal for sale, 2=premium for sale, 3=expiring soon, 10=unavailable and unknown.
 * @returns {object} doms - modified key/value list of domains
 */
const DEBUG1 = false
export default function (doms_arr, { DEBUG_TIME = false }: any = {}) {
  return new Promise((resolve) => {
    // debug time
    let time_start = Date.now()
    let time_debug = function (message: string | number = "") {
      if (DEBUG_TIME) {
        global.cconsole.log(
          "DEBUG_TIME (moi) MANY (" + doms_arr.length + ")",
          ((Date.now() - time_start) / 1000).toFixed(3),
          message
        )
      }
    }
    // start
    let doms_dict: any = {}
    let doms_length = doms_arr.length
    if (!doms_length) {
      global.cconsole.warn("empty list of input doms gets empty list of results")
      resolve([])
    }
    if (doms_length > 50) {
      global.cconsole.warn("received too many domains to availability_moi. max 50")
      doms_arr = doms_arr.slice(0, 50)
    }
    // request
    let url = "https://esb.encircapartners.com/api/encirca/58c17bc817ad67141c60b40f/checkDomainPrice"
    let data: any = {
      domains: doms_arr.join(","),
      limit: 50
    }
    axios
      .post(url, data)
      .then((response) => {
        // find dom in list, and modify its status
        for (let item of response.data.results) {
          let domname = item.domain
          if (item.avail) {
            let price = Number(item.price.replace(/[^\d.]/g, ""))
            if (price) {
              doms_dict[domname] = [price < 100 ? 1 : price]
            } else {
              doms_dict[domname] = [10000001]
              // maybe later - "other"
              // if (item.reason) {
              //   doms[domname] = 9
              // }
            }
          }
        }
        if (DEBUG1) {
          global.cconsole.info("doms", doms_dict)
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
