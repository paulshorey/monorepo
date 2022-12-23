let __root = new URL("../", import.meta.url).pathname
if (__root[__root.length - 1] === "/") {
  __root = __root.slice(0, -1)
}
global["__root"] = __root

/*
 * Debugging (and other flags)
 */
global["DEBUG_PATHS"] = true

/*
 * CLI control (pm2 and other bash commands)
 */
import * as child_process from "child_process"
const exec = child_process.exec
global.execute = function (command, callback) {
  exec(command, function (error, stdout) {
    if (callback) {
      callback(stdout, error)
    }
  })
}

/*
 * Host
 */
import * as os from "os"
global["hostname"] = os.hostname()
global["hosttype"] = os.type()
global["DEVELOPMENT"] = global["hosttype"].toLowerCase().includes("darwin")

//
// Error reporting
//
import parse_error_message from "@techytools/fn/io/err/parse_error_message"
import * as Airbrake from "@airbrake/node"
import { http_response } from "@ps/nlp/api/lib/http"
const airbrake = new Airbrake.Notifier({
  projectId: 268629,
  projectKey: "a51fcfa809e5edfa05e612f8de171f48",
  environment: global["DEVELOPMENT"] ? "development" : "production"
})

//
// Cloud logging
//
import logdna from "@logdna/logger"
let dnaOptions: any = {
  hostname: global["hostname"],
  hosttype: global["hosttype"],
  app: "nlpbe-node-api",
  source: global["DEVELOPMENT"] ? "development" : "production",
  level: "trace"
}
let dnaConsole = logdna.createLogger("42ce61a790ba92d5c1661e4ad3affb83", dnaOptions)
// LogDNA stops listening after a while, then starts again AFTER it receives a message.
// Unfortunately, it drops the first 1 or 2 messages after a long silence!
// So, ping it every 60 seconds, to keep its listener alive.
let nlogged = 0
setInterval(function () {
  nlogged++
  dnaConsole.log(nlogged + "")
}, 60000)

//
// Console logging
//
import { cconsoleInit } from "@techytools/cc"
global.cconsole = cconsoleInit({
  useTrace: true,
  useColor: true,
  logToCloud: {
    log: function (str: string) {
      dnaConsole.log(str)
    },
    info: function (str: string) {
      dnaConsole.log(str, { level: "info" })
    },
    warn: function (str: string) {
      dnaConsole.log(str, { level: "warn" })
    },
    error: function (str: string) {
      airbrake.notify(str)
      dnaConsole.log(str, { level: "error" })
    }
  }
})
global.cconsole.success("Starting server environment: ", global["DEVELOPMENT"] ? "development" : "production")
global.handleError = (err) => {
  try {
    // respond to client
    if (global.res && http_response) {
      // http_response will log the error, so don't do it again in this file
      http_response(global.res, 500, parse_error_message(err))
    } else {
      // log to console
      global.cconsole.error(parse_error_message(err))
    }
  } catch (e) {
    // fatal misconfiguration - redeploy codebase
    global.execute(`bash ${__root}/_bash/_start_production.sh`)
  }
}
process.on("uncaughtException", global.handleError)
process.on("unhandledRejection", global.handleError)
