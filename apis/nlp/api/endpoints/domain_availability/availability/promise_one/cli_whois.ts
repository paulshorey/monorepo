let DEBUG1 = false
let DEBUG2 = false

import import_localstorage from "node-localstorage"
let { LocalStorage } = import_localstorage
let localStorage = new LocalStorage("tmp/localStorage-whois6")

export default function (domstr, options: any = {}) {
  return new Promise((resolve) => {
    /*
     * don't spend too long on one request
     */
    let resolved = false
    setTimeout(() => {
      if (!resolved) {
        resolve({ [domstr]: [-1, "", "timedout"] })
      }
    }, 3300)
    let time_now = Date.now()

    /*
     * get whois
     */
    if (DEBUG2) console.log("whois execute...")
    global.execute("whois " + domstr, (whois) => {
      whois = whois.toLowerCase()
      if (DEBUG2) console.log("whois results: ", domstr, whois)
      let output: any = { dom: domstr, code: 0 }
      let cre_yr = undefined
      let cha_yr = undefined
      let exp_yr = undefined
      try {
        // let idot = domstr.indexOf(".")
        // if (!idot) {
        //   resolved = true
        //   resolve(output)
        // }
        // output.sld = domstr.substring(0, idot)
        // output.tld = domstr.substr(idot+1)
        {
          let matches = whois.match(/.*?creat.*?([0-9]{4})(.*)\s/g)
          if (matches) {
            for (let line of matches) {
              if (DEBUG1) console.log("createds", line)
              let matched = line.match(/.*?creat.*?([0-9]{4})(.*)/)
              if (matched) {
                if (DEBUG1) console.log("created", matched)
                cre_yr = Number(matched[1])
              }
            }
          }
        }
        {
          if (
            whois.includes("is reserved") ||
            whois.includes("been reserved") ||
            whois.includes("reserved by") ||
            whois.includes("reserved name") ||
            whois.includes("icann reserved") ||
            whois.includes("registry reserved") ||
            whois.includes("not available") ||
            whois.includes("unavailable")
          ) {
            output.reserved = true
            output.code = 10000003
          }
        }
        {
          if (whois.includes("not found")) {
            output.code = 1
          }
        }
        {
          if (whois.length < 200) {
            output.code = -1
            // global.cconsole.warn(domstr, whois)
            localStorage.setItem(domstr, whois)
          }
        }
        {
          let matches = whois.match(/.*?hange.*?([0-9]{4})(.*)\s/g)
          if (matches) {
            for (let line of matches) {
              if (DEBUG1) console.log("changeds", line)
              let matched = line.match(/.*?change.*?([0-9]{4})(.*)/)
              if (matched) {
                if (DEBUG1) console.log("changed", matched)
                cha_yr = Number(matched[1])
              }
            }
          }
        }
        {
          let matches = whois.match(/.*?xpir.*?([0-9]{4})(.*)\s/g)
          if (matches) {
            for (let line of matches) {
              if (DEBUG1) console.log("expiress", line)
              let matched = line.match(/.*?expir.*?([0-9]{4})(.*)/)
              if (matched) {
                if (DEBUG1) console.log("expires", matched)
                exp_yr = Number(matched[1])
                if (exp_yr && matched[2]) {
                  // chop of time, leave only date
                  let i_t = matched[2].indexOf("t")
                  if (i_t !== -1) {
                    matched[2] = matched[2].substring(0, i_t)
                  }
                  // fix dashes
                  matched[2] = matched[2].replace(/[^\d-]+/g, "-").replace(/--/g, "-")
                  // parse year/month
                  output.expires = exp_yr + matched[2].substring(0, 5)
                  // expiring soon ?
                  let date = new Date(output.expires)
                  let time = date.getTime()
                  if (!!time && time - 2592000000 < time_now) {
                    output.code = time
                  } else {
                    output.code = 10000001
                  }
                }
              }
            }
          }
        }
        {
          let matches = whois.match(/.*?(ns:|name server|nameserver|nserver).*? \w+\.(.+)(\s|\n)/g)
          if (matches) {
            for (let line of matches) {
              if (DEBUG1) console.log("nss", line)
              let matched = line.match(/.*?(ns:|name server|nameserver).*? \w+\.(.+)(\s|\n)/)
              if (matched) {
                if (DEBUG1) console.log("ns", matched)
                if (matched && matched[2] && matched[2].length < 75) {
                  output.ns = matched[2]
                  break
                }
              }
            }
          }
        }
        if (output.ns) {
          if (output.ns.includes("nameprovider.net")) {
            output.aftermarket = true
          } else if (output.ns.includes("sedoparking.com")) {
            output.aftermarket = true
          } else if (output.ns.includes("uniregistrymarket")) {
            output.aftermarket = true
          } else if (output.ns.includes("namefind.com")) {
            output.aftermarket = true
          } else if (output.ns.includes("domainsales.app")) {
            output.aftermarket = true
          } else if (output.ns.includes("cnolnic.net")) {
            output.aftermarket = true
          } else if (output.ns.includes("epik.com")) {
            output.aftermarket = true
          } else if (output.ns.includes("namelot.com")) {
            output.aftermarket = true
          } else if (output.ns.includes("safenames.net")) {
            output.aftermarket = true
          } else if (output.ns.includes("bodis.com")) {
            output.aftermarket = true
          } else if (
            output.ns.includes(".dan.") ||
            output.ns.includes("undeveloped.com") ||
            output.ns.includes("break.click")
          ) {
            output.ns = ".dan.com"
            output.aftermarket = true
          } else if (output.ns.includes("afternic.com")) {
            output.aftermarket = true
          }
        }
        {
          if (whois.includes("is available") || whois.includes("platinum") || whois.includes("premium")) {
            output.premium = true
            output.code = 501
          }
        }
        // if (!output.created) {
        // output.error = "!created"
        // let matched = whois.match(/.*?prohibit|reserve|invalid|shorter|unable|error|0 objects/)
        // if (matched && matched.input && matched.index > -1) {
        //   // find a good place to cut off - nearest linebreak, or space after few words
        //   let i = matched.index
        //   let matched_break = matched.input.substr(i).match(/.*?\sand|\.\s|,|!|;|\n|\r|\t/)
        //   let nearest_break = matched_break ? matched_break.index : 0
        //   // set error message
        //   output.error = matched.input.substring(i, nearest_break)
        // }
        // }
        {
          output.registered = undefined
          if (output.premium) {
            output.registered = false
            if (output.code <= 1) output.code = 501
          } else if (output.aftermarket) {
            output.registered = { aftermarket: output.ns }
            if (output.code <= 1) output.code = 1501
          } else if (output.expires) {
            output.registered = { expires: output.expires }
          } else if (output.ns) {
            output.registered = { ns: output.ns }
            if (output.code <= 1) output.code = 10000001
          }
        }
        {
          if (output.code === 0) {
            if (DEBUG1) global.cconsole.warn(whois)
            // output.whois = whois
          }
        }
      } catch (e) {
        global.cconsole.error(e)
        output.error = e.toString()
      }

      resolved = true
      let info = [output.code, output.aftermarket ? output.ns : "", output.expires || ""]
      if (options.whois) {
        info[3] = whois
      }
      resolve({ [domstr]: info })
    })
  })
}
