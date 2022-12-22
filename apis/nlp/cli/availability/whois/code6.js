import "dotenv/config" // contains secret keys ~ never push to GIT!
import "common/global.js" // contains secret keys ~ never push to GIT!
import import_localstorage from "node-localstorage"

let { LocalStorage } = import_localstorage
let localStorage = new LocalStorage("tmp/localStorage-whois6")

;(async function () {
  for (let li = 0; li < localStorage.length; li++) {
    let domstr = localStorage.key(li)
    let whois = localStorage.getItem(domstr)
    global.cconsole.warn(domstr, whois, "\n")
  }
  process.exit()
})()

// test
