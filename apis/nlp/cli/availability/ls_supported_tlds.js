import "dotenv/config" // contains secret keys ~ never push to GIT!
import "common/global.js" // contains secret keys ~ never push to GIT!
import import_localstorage from "node-localstorage"
import all_tlds from "@ps/nlp/data/domains/all"

let { LocalStorage } = import_localstorage
let localStorageSupported = new LocalStorage("tmp/localStorage-supportedTLDs")
let localStorageUnsupported = new LocalStorage("tmp/localStorage-unsupportedTLDs")

let DEBUG1 = false
;(async function () {
  for (let tld in all_tlds) {
    let whoisYes = localStorageSupported.getItem(tld)
    if (whoisYes) {
      if (whoisYes < 2000) {
        global.cconsole.info(tld, "whois", whoisYes)
      } else {
        global.cconsole.warn(tld, "whois", whoisYes)
      }
    }
    let whoisNo = localStorageUnsupported.getItem(tld)
    if (whoisNo) {
      global.cconsole.error(tld, "whois", whoisNo)
    }
  }
})()
