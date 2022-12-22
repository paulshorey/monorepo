import axios from "axios"
import { http_response } from "@ps/nlp/api/lib/http"

/*
 * THIS IS DIFFERENT FROM OTHER API ENDPOINTS IN THIS PROJECT
 * This is simply a proxy server to api.apify.com
 * Puppeteer/script is hosted there
 */
const fy: any = []
fy.push({
  api: "/v1/crawl/test",
  url: "https://api.scrapfly.io/scrape?key=scp-live-98129e9363444f748eea449b7facc6c8&url=https%3A%2F%2Fexample.com&tags=player%2Cproject%3Adefault&country=us",
  reqData: () => ({})
})
fy.push({
  api: "/v1/crawl/sedo",
  url: "https://api.apify.com/v2/acts/techy.tools~sedo-results/run-sync?token=Byc43cN3uZv2Xyxo9q6GPSvjD",
  reqData: (req) => ({ str: req.query.str })
})
fy.push({
  api: "/v1/crawl/afternic",
  url: "https://api.apify.com/v2/acts/techy.tools~afternic-results/run-sync?token=Byc43cN3uZv2Xyxo9q6GPSvjD",
  reqData: (req) => ({ str: req.query.str })
})

/*
 * Generate a list of endpoints - same format as all the other manually added ones
 */
export default fy.map((f) => ({
  path: f.api,
  method: "get",
  response: async function ({ req, res }) {
    return axios.post(f.url, f.reqData(req), { timeout: 22000 }).then((data) => {
      return (data && data.data) || {}
    })
  }
}))
