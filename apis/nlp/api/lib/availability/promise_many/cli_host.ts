// import check_ping from "@ps/nlp/api/lib/suggestions/promise_one/cli_host"
// time fping -c 1 -q -r 0 -t 200 -i 1 ${domstr}
// host -s -t ns -W 1 cyber.tech | head -n 1;
// also try dig if host failed

/**
 * CHECK DOMAIN AVAILABILITY @ ping
 * @param {array} doms_arr - list of domains to check
 *      key = domain name string, value = status code of availability
 * @returns {object} - key/value dict of {domain:status,}
 */
const DEBUG_TIME = false
const DEBUG1 = false
export default function (doms_arr, { DEBUG_TIME = false }: any = {}) {
  return new Promise(async (resolve) => {
    // debug time
    let time_start = Date.now()
    let time_debug = function (message: string | number = "") {
      if (DEBUG_TIME) {
        console.log(
          "DEBUG_TIME (cli_host) MANY (" + doms_arr.length + ")",
          ((Date.now() - time_start) / 1000).toFixed(3),
          message
        )
      }
    }
    // start
    let doms_dict: any = {}
    let start_time = Date.now()
    /*
     * don't spend too long on one request
     */
    let resolved = false
    setTimeout(() => {
      if (!resolved) {
        resolve({ error: "ping failed" })
      }
    }, 20000)

    /*
     * assemble commands string
     */
    let dom_nums = 0
    let cli_command = "{ "
    for (let domstr of doms_arr) {
      cli_command += `host -s -t ns -W 5 ${domstr} & `
      dom_nums++
    }
    cli_command += "} | cat"
    if (DEBUG1) global.cconsole.log(cli_command)

    /*
     * get whois
     */
    global.execute(cli_command, (ping_response) => {
      // compute
      let arr = ping_response.split("\n")
      for (let line of arr) {
        if (!line) continue
        let code = [0, ""]
        line = line.replace("Host ", "")
        let i_firstSpace = line.indexOf(" ")
        let dom = line.substr(0, i_firstSpace).toLowerCase()
        if (doms_dict[dom]) continue
        let ns = ""
        let i_nsStart = line.indexOf("name server ")
        if (i_nsStart) {
          ns = line.substr(i_nsStart + 12)
        }
        if (line.includes("NXDOMAIN")) {
          code = [10000001]
        } else if (ns.includes("nameprovider.net")) {
          code = [1501, "nameprovider.net"]
        } else if (ns.includes("sedoparking.com")) {
          code = [1501, "sedoparking"]
        } else if (ns.includes("uniregistrymarket")) {
          code = [1501, "uniregistrymarket"]
        } else if (ns.includes("namefind.com")) {
          code = [1501, "namefind"]
        } else if (ns.includes("domainsales.app")) {
          code = [1501, "domainsales.app"] // sedo/afternic/da'domainsales'n
        } else if (ns.includes("cnolnic.net")) {
          code = [1501, "cnolnic.net"] // sedo/afterni'cnolnic'c
        } else if (ns.includes("epik.com")) {
          code = [1501, "epik"] // sed'epik'o
        } else if (ns.includes("safenames.net")) {
          code = [1501, "safenames"]
        } else if (ns.includes("bodis.com")) {
          code = [1501, "bodis"]
        } else if (ns.includes(".dan.") || ns.includes(".undeveloped.com") || ns.includes(".break.click")) {
          code = [1501, "dan"]
        } else if (ns.includes("afternic.com")) {
          code = [1501, "afternic"]
        } else if (line.includes("SERVFAIL")) {
          code = [10000005, "", "not found NS"]
        } else if (line.includes("no NS record")) {
          code = [10000005, "", "no NS record"]
        } else if (line.includes(" alias ")) {
          code = [10000001, " alias "]
        } else if (line.includes("name server")) {
          code = [10000001, "", line]
        } else {
          code = [10000005, "", line]
        }
        if (DEBUG1) global.cconsole.log([dom], code)
        // to avoid sending back "0" statuses
        // if (!dom || !code[0]) continue;
        if (dom && code) {
          doms_dict[dom] = code
        }
      }
      // time
      if (DEBUG_TIME) {
        global.cconsole.info('cli_host length="' + dom_nums + '" time="' + (Date.now() - start_time) + ' ms"')
      }
      // return same format as was input
      time_debug(Object.keys(doms_dict).length)
      resolve(doms_dict)
    })
  })
}
