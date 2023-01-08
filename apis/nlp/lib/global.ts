import * as child_process from "child_process"
import * as os from "os"
import parse_error_message from "@techytools/fn/io/err/parse_error_message"
import * as Airbrake from "@airbrake/node"
import { httpResponse } from "@ps/nlp/api/http"
import logdna from "@logdna/logger"
import { cconsoleInit } from "@techytools/cc"
import initGlobalSecrets from "@ps/secrets/nlp-api-global"
import initGlobalSecretsDevelopment from "@ps/secrets/nlp-api-global-development"
import import_pg from "pg"

export default async function ({ NO_ASYNC = false, NO_LOGS = false } = {}) {
  /*
   * Database connection variables
   */
  await initGlobalSecrets()

  /*
   * Global variables
   */
  if (!global.__root) {
    let __root = new URL("../", import.meta.url).pathname
    if (__root[__root.length - 1] === "/") {
      __root = __root.slice(0, -1)
    }
    global.__root = __root
    global.DEBUG_PATHS = true
  }

  /*
   * CLI control (pm2 and other bash commands)
   */
  if (!global.execute) {
    const exec = child_process.exec
    global.execute = function (command, callback) {
      exec(command, function (error, stdout) {
        if (callback) {
          callback(stdout, error)
        }
      })
    }
  }

  /*
   * Host
   */
  global.hostname = os.hostname()
  global.hosttype = os.type()
  global.DEVELOPMENT = global.hosttype.toLowerCase().includes("darwin")

  //
  // Error reporting
  //
  if (!global.airbrake) {
    global.airbrake = new Airbrake.Notifier({
      projectId: 268629,
      projectKey: "a51fcfa809e5edfa05e612f8de171f48",
      environment: global.DEVELOPMENT ? "development" : "production"
    })
  }

  //
  // Cloud logging
  //
  if (!NO_ASYNC && !global.dnaConsole) {
    let dnaOptions: any = {
      hostname: global.hostname,
      hosttype: global.hosttype,
      app: "nlpbe-node-api",
      source: global.DEVELOPMENT ? "development" : "production",
      level: "trace"
    }
    global.dnaConsole = logdna.createLogger("42ce61a790ba92d5c1661e4ad3affb83", dnaOptions)
  }

  //
  // Console logging
  //
  if (!global.cconsole) {
    global.cconsole = cconsoleInit({
      disabled: !!NO_LOGS,
      useTrace: true,
      useColor: true,
      logToCloud: {
        log: function (str: string) {
          global.dnaConsole?.log(str)
        },
        info: function (str: string) {
          global.dnaConsole?.log(str, { level: "info" })
        },
        warn: function (str: string) {
          global.dnaConsole?.log(str, { level: "warn" })
        },
        error: function (str: string) {
          global.airbrake?.notify(str)
          global.dnaConsole?.log(str, { level: "error" })
        }
      }
    })
  }

  /*
   * Error handling
   */
  if (!global.handleError) {
    global.handleError = (err) => {
      try {
        // respond to client
        if (global.res && httpResponse) {
          // httpResponse will log the error, so don't do it again in this file
          httpResponse(global.res, 500, parse_error_message(err))
        } else {
          // log to console
          global.cconsole.error(parse_error_message(err))
        }
      } catch (e) {
        // fatal misconfiguration - redeploy codebase
        global.execute(`bash ${global.__root}/_bash/_start_production.sh`)
      }
    }
    process.on("uncaughtException", global.handleError)
    process.on("unhandledRejection", global.handleError)
  }

  /*
   * Overrides for DEVELOPMENT environment
   */
  await initGlobalSecretsDevelopment()

  /*
   * Connect to Postgres DB
   */
  if (!global.pgdb) {
    const { Pool } = import_pg
    global.pgdb = await new Pool({
      user: global.secrets.PG_USER,
      host: global.secrets.PG_HOST,
      database: global.secrets.PG_DATABASE,
      password: global.secrets.PG_PASSWORD,
      port: global.secrets.PG_PORT
    })
  }
}
