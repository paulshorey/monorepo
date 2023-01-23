import * as fs from "fs"
import * as http from "http"
import * as https from "https"
import parseErrorMessage from "@techytools/cc/src/function/parseErrorMessage"
import { Express } from "express-serve-static-core"

const logFatalError = function (error: Error) {
  global.cconsole.error(parseErrorMessage(error), error.stack)
  process.exit(1)
}

export default function (expressApp: Express) {
  const PORT = "1080"
  // LogDNA stops listening after a while, then starts again AFTER it receives a message.
  // Unfortunately, it drops the first 1 or 2 messages after a long silence!
  // So, ping it every 60 seconds, to keep its listener alive.
  let nlogged = 0
  setInterval(function () {
    nlogged++
    global.cconsole.log(nlogged + "")
  }, 60000)

  /*
   * SERVE
   */
  // HTTP
  const httpServer = http.createServer(expressApp)
  httpServer.on("error", logFatalError)
  httpServer.listen(PORT, () => {
    global.cconsole.log("HTTP Server running on port " + PORT)
  })
  // HTTPS
  if (global["DEVELOPMENT"]) {
    try {
      const ssl_key = fs.readFileSync(
        global.__root + `/_certs/api${process.env.PRODUCTION ? "" : "-staging"}.wordio.co.key`,
        "utf8"
      )
      const ssl_crt = fs.readFileSync(
        global.__root + `/_certs/api${process.env.PRODUCTION ? "" : "-staging"}.wordio.co.crt`,
        "utf8"
      )
      const ssl_credentials = { key: ssl_key, cert: ssl_crt }
      const httpsServer = https.createServer(ssl_credentials, expressApp)
      httpsServer.on("error", logFatalError)
      httpsServer.listen(1443, () => {
        global.cconsole.log("HTTPS Server running on port 1443")
      })
    } catch (e) {
      global.cconsole.error(e)
    }
  }

  /*
   * EXIT
   */
  process.on("exit", function (code) {
    return global.cconsole.log(`About to exit with code ${code}`)
  })
}
