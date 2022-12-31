import axios from "axios"

/*
 * THIS IS DIFFERENT FROM OTHER API ENDPOINTS IN THIS PROJECT
 * This is simply a proxy server to api.apify.com
 * Puppeteer/script is hosted there
 */
const sites: any = {}
sites.example = {
  url: "https://api.scrapfly.io/scrape?key=scp-live-98129e9363444f748eea449b7facc6c8&url=https%3A%2F%2Fexample.com&tags=player%2Cproject%3Adefault&country=us",
  reqData: () => ({})
}
sites.sedo = {
  url: "https://api.apify.com/v2/acts/techy.tools~sedo-results/run-sync?token=Byc43cN3uZv2Xyxo9q6GPSvjD",
  reqData: (req) => ({ str: req.query.str })
}
sites.afternic = {
  url: "https://api.apify.com/v2/acts/techy.tools~afternic-results/run-sync?token=Byc43cN3uZv2Xyxo9q6GPSvjD",
  reqData: (req) => ({ str: req.query.str })
}

/*
 * Generate a list of endpoints - same format as all the other manually added ones
 */
export default [
  {
    path: "/v1/crawl",
    method: "get",
    response: async function ({ req }) {
      let site = sites[req.query.site]
      return axios.post(site.url, site.reqData(req), { timeout: 22000 }).then((data) => {
        return (data && data.data) || {}
      })
    }
  }
]
