import "dotenv/config" // contains secret keys ~ never push to GIT!
import "common/global.js" // contains secret keys ~ never push to GIT!
import { parse_cli_args } from "pauls-pure-functions/functions/cli"
import fs from "fs"
// variables
import all_tlds from "@ps/nlp/data/domains/all_tlds_first_level"
// functions
import check_cli_whois from "@ps/nlp/api/domain_availability/availability/promise_one/cli_whois"
// fs
const fsPromises = fs.promises
const args = parse_cli_args()

/*
 * log to file
 */
const append_to_file = async function (name, text) {
  try {
    await fsPromises.appendFile("./output/" + name + ".txt", text + "\n")
  } catch (e) {
    global.cconsole.error(e)
  }
}

/*
 * do stuff
 */
const research_domain = async function (domstr) {
  let data: any = await check_cli_whois(domstr)
  delete data.whois
  return data
}

/*
 * init, save
 */
;(async function () {
  /*
   * test one tld from cli arg
   */
  let use_tlds = (Object.keys(all_tlds) || []).slice(0, 5)
  if (args.tld) {
    use_tlds = [args.tld]
  }

  /*
   * check each tld
   */
  for (let tld of use_tlds) {
    console.log("checking " + tld + " ...")
    let ms1 = Date.now()

    /*
     * test several strings
     */
    let datas = []
    for (let str of [
      "good",
      "free",
      "best",
      "asffsddddfdfdfsdffsdfdasfdfdsfsdf",
      "dafdfsfdjiljjajlkjkkkjhkhkjhkhkjh"
    ]) {
      let data: any = await research_domain(str + "." + tld)
      console.log(tld, data)
      await append_to_file("log", JSON.stringify(data))
      datas.push()
    }

    /*
     * debug delay
     */
    let ms2 = Date.now()
    let ms = ms2 - ms1

    /*
     * debug content
     */
    let created_different = false
    let created = undefined
    let expires_different = false
    let expires = undefined
    for (let data of datas) {
      console.log("data", data)
      if (created === undefined) {
        created = data.created
      }
      if (expires === undefined) {
        expires = data.expires
      }
      /*
       * make sure we're getting real results - not all same dates
       */
      if (data.created !== created) {
        created_different = true
      }
      if (data.expires !== expires) {
        global.res = res
        expires_different = true
      }
    }
    if (created_different || expires_different) {
      /*
       * Ok, this might work! :)
       */
      if (ms < 1) {
        // OK
        let txt = `"${tld}":true, // ${ms} milliseconds`
        global.cconsole.log(txt)
        await append_to_file("tlds", txt)
      } else {
        // Slow!
        let txt = `"${tld}":false, // ${ms} milliseconds`
        global.cconsole.log(txt)
        await append_to_file("tlds", txt)
      }
    } else {
      /*
       * No good! All whois are the same data!
       */
      let txt = `"${tld}":false, // no whois data`
      global.cconsole.warn(txt)
      await append_to_file("tlds", txt)
    }
  }

  /*
   * DONE
   */
  process.exit()
})()
