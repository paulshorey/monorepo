import "dotenv/config" // contains secret keys ~ never push to GIT!
import "common/global.js" // contains secret keys ~ never push to GIT!
import fs from "fs"
// variables
import tlds_samisaurus from "@ps/nlp/data/domains/availability/samisaurus"
import tlds_tld_list_az from "@ps/nlp/data/domains/availability/tld_list_az"
import tlds_cli_whois from "@ps/nlp/data/domains/availability/cli_whois"
import tlds_cli_whois_no from "@ps/nlp/data/domains/availability/cli_whois_no"
import tlds_whoisxmlapi from "@ps/nlp/data/domains/availability/whoisxmlapi"
import tlds_name from "@ps/nlp/data/domains/availability/name"
// fs
const fsPromises = fs.promises
// init
;(async function () {
  // output
  let tlds_master_dict: any = {}

  // combine lists
  for (let dict of [
    tlds_samisaurus,
    tlds_name,
    tlds_tld_list_az,
    tlds_cli_whois,
    tlds_cli_whois_no,
    tlds_whoisxmlapi
  ]) {
    for (let tld in dict) {
      if (!tlds_master_dict[tld]) {
        if (!tld.includes(".")) {
          tlds_master_dict[tld] = true
        }
      }
    }
  }

  // dump
  let list = Object.keys(tlds_master_dict)
  let text = "export default " + JSON.stringify(tlds_master_dict, null, " ")
  try {
    await fsPromises.writeFile("./output/all_tlds_first_level.js", text, { flag: "w" })
  } catch (e) {
    global.cconsole.error(e)
  }

  /*
   * DONE
   */
  process.exit()
})()
