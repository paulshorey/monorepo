import initGlobal from "@ps/nlp/lib/global" // also used by unit tests
import initApp from "./initApp" // also used by unit tests
import * as fs from "fs"
import * as http from "http"
import * as https from "https"

const serverStartError = function (error) {
  if (error.syscall !== "listen") {
    throw error
  }
  const bind = typeof global.PORT === "string" ? "Pipe " + global.PORT : "Port " + global.PORT
  switch (error.code) {
    case "EACCES":
      global.cconsole.error(bind + " requires elevated privileges")
      process.exit(1)
    case "EADDRINUSE":
      global.cconsole.error(bind + " is already in use")
      process.exit(1)
    default:
      throw error
  }
}

initGlobal()
const PORT = "1080"
const expressApp = initApp()
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
httpServer.on("error", serverStartError)
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
    httpsServer.on("error", serverStartError)
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
