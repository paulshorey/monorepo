import { Client } from "@elastic/elasticsearch"
import "dotenv/config" // contains secret keys ~ never push to GIT!
import "common/global.js" // contains secret keys ~ never push to GIT!
const client = new Client({ node: "http://localhost:9200" })
// import { object_keys_from_array_values } from "pauls-pure-functions/esm/objects"
const myArgs = process.argv.slice(2)
const searchStr = myArgs[0]
const time_start = Date.now()

;(async function () {
  console.clear()
  // promise API
  const result = await client.search({
    index: "en-wikipedia",
    body: {
      query: {
        match: { title: searchStr }
      }
    }
  })
  let output_lower: any = {}
  let output: any = {}

  let re_beforeAfter = "[\\p{L}\\d: ’'\"-]"
  let re = new RegExp("(" + re_beforeAfter + "{0,120})(" + searchStr + ")(" + re_beforeAfter + "{0,240})", "ugim")
  let re_all = new RegExp("(.{0,120})(" + searchStr + ")(.{0,240})", "ugim")
  if (result.body.hits.hits) {
    // console.log("result.body.hits.hits.length", result.body.hits.hits.length)
    for (let li = 0; li < result.body.hits.hits.length; li++) {
      try {
        // console.log("li", li)
        // console.log(result.body.hits.hits[li])
        let score = Math.round(result.body.hits.hits[li]._score)
        let title = result.body.hits.hits[li]._source.title
        let title_lower = title.toLowerCase()
        // console.log([result.body.hits.hits[li]._source.id])
        // console.log([title])
        if (!output_lower[title_lower]) {
          output[title] = title //title
          output_lower[title_lower] = title
        }
        if (result.body.hits.hits[li]._source.redirect) continue
        let text = result.body.hits.hits[li]._source.revision.text._ || ""
        text = text.replace(/{{.*?}}/g, " ")
        text = text.replace(/http.+html|\||\s|http/g, " ")
        text = text.replace(/([A-Z]{1})\./g, "$1")
        text = text.replace(/\.\.\.|\[\[|]]|===/g, "")
        text = text.replace(/([\p{L}]+)[\d]+/gu, "$1")
        text = text.replace(/%[0-9]{2}|\s+|\+|-/g, " ")
        text = text.replace(/  /g, "\n")
        let lines = text.split("\n")
        let line_n = 0
        for (let line of lines) {
          try {
            let text_found = line.match(re)
            let text_all = line.match(re_all)
            for (let idx in text_all) {
              let line = text_found[idx]
              line = line.replace(/'s|’s/g, "*s")
              line = line.replace(/['’]+/g, "")
              line = line.replace(/\*/g, "’").trim()
              let line_lower = line.toLowerCase()
              if (output[line_lower]) continue
              // console.log(Number(idx))
              // console.log([line])
              // console.log(text_all[idx])
              output[line] = title //title
              output_lower[line_lower] = title
              line_n++
              if (line_n >= 10) break
            }
          } catch (e) {}
        }
      } catch (e) {
        console.error(e)
      }
    }

    global.cconsole.log("\n\n\nsearch results:")
    for (let line in output) {
      let title = output[line]
      global.cconsole.info(line, title)
    }
  }

  console.log("\n", ((Date.now() - time_start) / 1000).toFixed(2))
  process.exit()
})()
