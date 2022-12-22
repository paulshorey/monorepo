import import_localstorage from "node-localstorage"
// import internal_availability from "../index"

let { LocalStorage } = import_localstorage
let localStorage = new LocalStorage("tmp/localStorage-domainsAvailability")
// console.log('global["hostname"]',global["hostname"]);

/**
 * CHECK DOMAIN AVAILABILITY
 * @param {object} domains - list of domains to check
 *      Key is full domain name {string}.
 *      Value is status {number}.
 * @returns {object} - modified key/value dict, from input list of domains
 */
let DEBUG1 = false // reminder of how this works, what happens when
let DEBUG2 = false // something broken, find the spot

let USE_CACHE = false
let DEBUG_TIME = false
export default function ({ domains = [], options = {} }: any) {
  return new Promise(function (resolve, reject) {
    // debug time
    let time_start = Date.now()
    let time_debug = function (message: string | number = "") {
      if (DEBUG_TIME) {
        global.cconsole.info("TIME /round_robin", ((Date.now() - time_start) / 1000).toFixed(3), message)
      }
    }
    if (!("method" in options)) {
      options.method = options.not_ping || false
    }
    // start
    let output: any = {}
    let output_dict: any = {}
    let n_from_localstorage = 0

    /*
     * IMPORTANT: never have fewer than 2 bucket_hosts
     * if only 1 bucket, buckets[bi].push(dom) will break
     * TODO: fix `let bi = di % buckets_num` where di===1
     */
    let bucket_hosts = [
      "http://206.189.196.235",
      "http://67.205.184.42",
      "http://67.205.139.248",
      "http://159.89.91.72",
      "http://68.183.17.104",
      "http://192.241.139.209",
      "http://206.189.207.22",
      "http://157.230.185.79",
      "http://157.230.187.25"
    ]
    if (!global["hostname"].includes("MacBook")) {
      bucket_hosts.push("http://localhost:1080") // prettier-ignore
    }
    // now, in production, should be 10 buckets
    let buckets = bucket_hosts.map(() => [])
    if (domains.length <= 90) {
      buckets.pop()
      if (domains.length <= 80) {
        buckets.pop()
        if (domains.length <= 70) {
          buckets.pop()
          if (domains.length <= 60) {
            buckets.pop()
            if (domains.length <= 50) {
              buckets.pop()
              if (domains.length <= 40) {
                buckets.pop()
                if (domains.length <= 30) {
                  buckets.pop()
                  if (domains.length <= 20) {
                    buckets.pop()
                    if (domains.length <= 10 && buckets.length > 1) {
                      buckets.pop()
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    /*
     * LOAD SAVED STATUS FROM CACHE
     * filter out the ones already checked
     *
     * SPLIT/GROUP NEW DOMS INTO SEVERAL REQUESTS
     * to other servers, to distribute the load
     */
    let di = 0
    for (let domname of domains) {
      let code = localStorage.getItem(domname + "status" + options.method)
      if (code) code = Number(code) || 0
      // let tuple0 = USE_CACHE ? localStorage.getItem(domname + "status" + ooptions.method) : false
      if (domname === "secretlyclearcache.com") {
        /*
         * BUST CACHE (and send bustcache to all servers)
         */
        let row: any = {
          subject: "secretlyclearcache.com",
          email: "paul@besta.domains",
          name: "availability",
          text:
            "clear cache round_robin() IP: " + global["hostname"] + " " + (global["DEVELOPMENT"] ? "DEVELOPMENT" : ""),
          date: new Date()
        }
        //
        global.cconsole.warn("localStorage.clear()")
        localStorage.clear()
        //
        for (let bi in buckets) {
          buckets[bi].push(domname)
        }
      } else if (USE_CACHE && code > 0) {
        /*
         * USE CACHE
         */
        n_from_localstorage++
        output.status[domname] = code
        // // check for nameserver info
        // let ns = localStorage.getItem(domname + options.method + "-ns")
        // if (ns) {
        //   output.ns[domname] = ns
        // }
      } else {
        /*
         * ADD TO BUCKET (to fetch value)
         */
        let bi = di % buckets.length
        if (DEBUG2) global.cconsole.log('add "' + domname + '" to bucket ', bi)
        buckets[bi].push(domname)
        di++
      }
    }

    /*
     * COMPILE REQUESTS
     * use cURL CLI to avoid Promise.all lag and extra code lag
     */
    let options_json = JSON.stringify(options)
    let curl_arr = []
    try {
      bucket_hosts.forEach(function (host, bi) {
        let bucket = buckets[bi]
        if (!bucket) return
        if (DEBUG1) global.cconsole.info("fill bucket " + host + " with ", bucket)
        let curl = `curl -d '{"domains":${JSON.stringify(
          bucket
        )},"options":${options_json}}' -H 'Content-Type: application/json' ${host}/v1/availability_one`
        curl_arr.push(curl)
      })
    } catch (e) {
      if (DEBUG1) global.cconsole.error(e)
    }

    /*
     * SEND REQUESTS
     * all cURL strings concurrently
     */
    // if (DEBUG_TIME) time_debug("send")
    let cli_command = curl_arr.join(" & ")
    if (DEBUG1) global.cconsole.warn("executing curl cli_command ... length = " + cli_command.length)
    if (DEBUG2) global.cconsole.log(cli_command)
    global.execute(cli_command, (response) => {
      if (DEBUG_TIME) time_debug("received " + curl_arr.length)
      let responses = []
      try {
        if (typeof response === "string") {
          let start_at = response.indexOf("{")
          if (start_at !== -1) {
            response = response.substr(start_at)
          }
        }
        if (response.includes("}{")) {
          response = response.replace(/}{/g, "}***{")
          responses = response
            .split("***")
            .filter((str) => str[0] !== "<")
            .map((str) => (str && (str[0] === "{" || str[0] === "[") ? JSON.parse(str) : {}))
        } else if (response[0] === "{") {
          responses = [JSON.parse(response)]
        } else if (typeof response === "string") {
          responses = [response]
        }
      } catch (e) {
        // global.cconsole.error(e)
        // global.cconsole.log(response)
      }
      if (DEBUG1) global.cconsole.warn("responses", responses)

      /*
       * AGGREGATE RESPONSES
       * expects to get back dictionary of {domname:status,...}
       */
      for (let response of responses) {
        if (!response.data) continue

        // aggregate datas
        for (let type in response.data) {
          let dict = response.data[type]
          if (dict) {
            output[type] = { ...(output[type] || {}), ...dict }
          }
        }
      }

      /*
       * CACHE
       */
      if (output.status && typeof output.status === "object") {
        for (let domstr in output.status) {
          localStorage.setItem(domstr + "status" + options.method, output.status[domstr])
        }
      }

      /*
       * GOOD RESPONSE
       */
      resolve(output)
    })
  })
}
