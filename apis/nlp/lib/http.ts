import parse_error_message from "@techytools/fn/io/err/parse_error_message"
import auth from "@ps/nlp/lib/auth"
import { cconsoleInit } from "@techytools/cc"

export const endpointHandler = function ({ expressApp, method, path, response, authFunctions }) {
  expressApp[method](path, async function (req, res) {
    let timeStart = Date.now()
    global.res = res
    if (global.DEBUG_PATHS) global.cconsole?.info(`${method.toUpperCase()} ${path}`, req.query, req.body)
    // authenticate
    let user = await auth({ req, authFunctions })
    if (user instanceof Error) {
      const err = `Authentication error: ${user}`
      errorHandler({ err, req, res, method, path })
      throw err
    }
    // fetch data
    const data = await response({ req, res })
    let meta = {
      user,
      responseTime: Date.now() - timeStart,
      host: req.headers.host
    }
    // error message
    if (data instanceof Error) {
      httpResponse(res, 500, data, meta)
      throw data
    } else {
      // response
      httpResponse(res, 200, data, meta)
    }
  })
}

export const errorHandler = function ({ err, req, res, method, path }) {
  err.request = `${method.toUpperCase()} ${path}`
  err.user_id = req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress
  let arr = err.stack ? err.stack.split("\n") : [err.message]
  httpResponse(res, 500, arr[0], { method, path })
  // global.cconsole.error(`request(${err.request})`, `user(${err.user_id})`, `err(${arr[0]} / ${arr[1]})`)
  throw `request(${err.request}) user(${err.user_id}) err(${arr[0]} / ${arr[1]})`
}

export const httpResponse = function (response, status_code: number, data: any, extras?: any) {
  // always respond with JSON
  response.setHeader("Content-Type", "application/json")
  response.writeHead(Number(status_code) || 200)
  let meta = {
    documentation: "https://documenter.getpostman.com/view/23360867/2s8YzXtewC",
    status: "success",
    code: 200,
    dev: !!global.DEVELOPMENT,
    hostname: global.hostname,
    hosttype: global.hosttype
  }
  let output
  if (status_code >= 200 && status_code < 300) {
    // success
    output = {
      ...meta,
      ...extras,
      data
    }
  } else {
    // system "error" or user inputs "fail"ed
    meta.status =
      status_code >= 500 || ((!status_code || status_code < 500) && typeof data === "object") ? "error" : "fail"
    meta.code = data.code || status_code || 400
    output = {
      ...meta,
      ...extras,
      error: {
        code: status_code,
        message: parse_error_message(data)
      }
    }
    // error
    if (output.status === "error") {
      global.cconsole.error(data)
    }
  }
  response.write(JSON.stringify(output, null, "\t"))
  response.end()
}
