import bodyParser from "body-parser/index"
import import_expressApp from "express/index"
import cors from "cors"
import * as RequestIp from "@supercharge/request-ip"
import { Express } from "express-serve-static-core"

export default function (): Express {
  const { getClientIp } = RequestIp
  const expressApp: Express = import_expressApp()
  const DEBUG1 = false

  // Headers
  if (DEBUG1) {
    // app.use(... is same as app.all('/*',...
    expressApp.use(function (req, res, next) {
      global.cconsole?.warn(`"${req.method}"`, req.path)
      global.cconsole?.log("headers", req.headers)
      global.cconsole?.log("query", req.query)
      global.cconsole?.log("body", req.body)
      next()
    })
  }

  // CORS
  expressApp.use(cors())

  // detect real IP address of request
  expressApp.use(function (req: any, res, next) {
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

  // Error handler
  expressApp.use((err, req, res, next) => {
    res.status(500).send({ error: err.message })
  })

  // // Modify output
  // const responseInterceptor = function (req, res, next) {
  //   const originalSend = res.send

  //   res.send = function () {
  //     global.cconsole.log("arguments", arguments)
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
   * Return express app (will be used by nlp/index.ts or jest tests)
   */
  return expressApp
}
