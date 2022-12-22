// form request
import axios from "axios"

let DEBUG_TIME = false
export default function (doms_arr, { DEBUG_TIME = false }: any = {}) {
  return new Promise((resolve) => {
    // debug time
    let time_start = Date.now()
    let time_debug = function (message: string | number = "") {
      if (DEBUG_TIME) {
        console.log(
          "DEBUG_TIME (domainr) MANY (" + doms_arr.length + ")",
          ((Date.now() - time_start) / 1000).toFixed(3),
          message
        )
      }
    }
    // start
    let output: any = { status: {}, note: {} }
    const MAX_DOMS = 50
    let doms_length = doms_arr.length
    if (!doms_length) {
      global.cconsole.warn("empty list of input doms gets empty list of results")
      resolve([])
    }
    if (doms_length > MAX_DOMS) {
      global.cconsole.error("received too many domains. limiting to " + MAX_DOMS)
      doms_arr = doms_arr.slice(0, MAX_DOMS)
    }

    /*
     * get availability
     */
    let url = "https://domainr.p.rapidapi.com/v2/status"
    let data: any = {
      domain: doms_arr.join(",")
    }
    let headers: any = {
      "x-rapidapi-host": "domainr.p.rapidapi.com",
      "x-rapidapi-key": "11dc13858emshc2393c506bb7d52p12d7e3jsnc48d54772625"
      // "x-rapidapi-key": "f642886f28mshe23b0f8b9df08b4p120d73jsnfaa9d35389db"
    }

    // send request
    axios
      .get(url, {
        params: data,
        headers: headers
      })
      .then((response) => {
        // global.cconsole.log("received domainr response")
        if (response.data.status && response.data.status[0]) {
          for (let result of response.data.status) {
            let code = 0
            let status = result.status
            let sarray = status.split(" ")
            if (sarray.includes("premium") && !sarray.includes("active")) {
              if (sarray.includes("marketed")) {
                code = 5
              } else {
                code = 3
              }
            } else if (sarray.includes("active") && !sarray.includes("marketed")) {
              code = 1
            } else if (sarray.includes("claimed")) {
              code = 1
            } else if (sarray.includes("marketed")) {
              code = 4
            } else if (sarray.includes("reserved")) {
              code = 1
            } else if (status === "inactive" || (sarray.includes("undelegated") && sarray.includes("inactive"))) {
              code = 2
            } else if (sarray.includes("expiring") || sarray.includes("deleting")) {
              code = 6
            } else {
              code = 1
            }

            output.status[result.domain] = code
            output.note[result.domain] = status
          }
        }
        if (DEBUG_TIME) time_debug(Object.keys(output.status).length)
        resolve(output)
      })
      .catch((error) => {
        global.cconsole.error(error)
        time_debug("ERROR")
        resolve(error)
      })
  })
}
