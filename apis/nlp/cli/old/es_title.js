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

  if (result.body.hits.hits) {
    // console.log("result.body.hits.hits.length", result.body.hits.hits.length)
    for (let li = 0; li < result.body.hits.hits.length; li++) {
      try {
        let score = Math.round(result.body.hits.hits[li]._score)
        let title = result.body.hits.hits[li]._source.title
        global.cconsole.info(title, score)
      } catch (e) {
        console.error(e)
      }
    }
  }

  console.log("\n", ((Date.now() - time_start) / 1000).toFixed(2))
  process.exit()
})()
