import puppeteer from "puppeteer"
// https://devdocs.io/puppeteer/index#pagegotourl-options
;(async function () {
  const getBrowser = () =>
    true
      ? puppeteer.connect({
          browserWSEndpoint: "wss://chrome.browserless.io?token=ebc62e13-9098-4d77-acae-355bba2f4565"
        })
      : puppeteer.launch()

  let URL = `https://sedo.com/search/?keyword=helloworld.com&price_end=1000&price_start=10&len_max=7&campaignId=326988`
  let browser = null
  try {
    browser = await getBrowser()
    let page: any = await browser.newPage()
    console.log(`Navigating to ${URL}...`)
    // Navigate
    await page.goto(URL, {
      waitUntil: "domcontentloaded",
      timeout: 0
    })

    // Load
    await page.waitForSelector("#search-result-list .item-result")
    // Scrape
    let results: any = await page.$$eval(".item-result", (elements) => {
      let doms = []
      Array.from(elements).forEach((el, ei) => {
        let dom: any = {}
        try {
          dom.name = el.querySelector(".domainname").innerText.trim() + el.querySelector(".domaintld").innerText.trim()
          dom.price = el
            .querySelector(".item-price")
            .innerText.trim()
            .replace(" USD", "")
            .replace(/[^\d]+/g, "")
        } catch (e) {
          // dom.error1 = e.message
        }
        try {
          dom.type = el.querySelector(".item-cta").innerText.trim()
        } catch (e) {
          // dom.error2 = e.message
        }
        // if (!dom.name) {
        //   return
        // }
        doms.push(dom)
      })
      return doms
    })
    console.log(results)
  } catch (error) {
    console.error(error)
  } finally {
    if (browser) {
      browser.disconnect()
    }
  }
})()
