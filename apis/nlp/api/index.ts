// import path from "path"
import initGlobals from "./global"
import * as fs from "fs"
import * as http from "http"
import * as https from "https"
import bodyParser from "body-parser/index"
import import_expressApp from "express/index"
import cors from "cors"
import { serverStartError } from "@ps/nlp/api/lib/process"
import * as RequestIp from "@supercharge/request-ip"
import { endpointHandler } from "@ps/nlp/api/lib/http"
import api_endpoints from "./endpoints"
import customEnv from "custom-env"

initGlobals()
customEnv.env("local")
customEnv.env()
const { getClientIp } = RequestIp
const expressApp = import_expressApp()
const PORT = "1080"
const DEBUG1 = false

// Headers
if (DEBUG1) {
  // app.use(... is same as app.all('/*',...
  expressApp.use(function (req, res, next) {
    global.cconsole.warn(`"${req.method}"`, req.path)
    global.cconsole.log("headers", req.headers)
    global.cconsole.log("query", req.query)
    global.cconsole.log("body", req.body)
    next()
  })
}

// CORS
expressApp.use(cors())

// detect real IP address of request
expressApp.use(function (req, res, next) {
  req.client_ip = getClientIp(req)
  req.host_is_dev = global["DEVELOPMENT"]
  next()
})

// Intercept input/output
expressApp.use(bodyParser.urlencoded({ extended: false }))
expressApp.use(bodyParser.json())

// Error logs
// expressApp.use(airbrakeExpress.makeMiddleware(global["airbrake"]))
// expressApp.use(airbrakeExpress.makeErrorHandler(global["airbrake"]))

// // Modify output
// const responseInterceptor = function (req, res, next) {
//   const originalSend = res.send

//   res.send = function () {
//     console.log("arguments", arguments)
//     arguments[0] = "TEST " + arguments[0]
//     originalSend.apply(res, arguments)
//   }
//   next()
// }
// expressApp.use(responseInterceptor)

/*
 * Show error
 */
expressApp.use(function (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.render("error", { error: err })
})

/*
 * Handle each API endpoint
 */
global.cconsole.success("Starting server environment: ", global["DEVELOPMENT"] ? "development" : "production")
for (let endpoint of api_endpoints) {
  const { path, method, auth = [], response }: any = endpoint
  endpointHandler({
    expressApp,
    path,
    method,
    auth,
    response
  })
}

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
if (!global["DEVELOPMENT"]) {
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
    console.log("ssl_credentials", ssl_credentials)
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
