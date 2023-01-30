import parse_error_message from "@techytools/fn/io/err/parse_error_message"
import parse_error_stack from "@techytools/fn/io/err/parse_error_stack"
import auth from "@ps/nlp/lib/auth"

export const endpointHandler = function ({ expressApp, method, path, response, authFunctions }) {
  expressApp[method](path, async function (req, res) {
    let timeStart = Date.now()
    global.res = res
    if (global.DEBUG_PATHS) global.cconsole?.info(`${method.toUpperCase()} ${path}`, req.query, req.body)
    // authenticate
    const meta = {
      user: {},
      responseTime: Date.now() - timeStart,
      host: req.headers.host
    }
    try {
      meta.user = await auth({ req, authFunctions })
    } catch (err) {
      return respondWithError({ req, res, err, data: { type: "authentication", method, path } })
    }
    // fetch data
    let data: any
    try {
      data = await response({ req, res })
      return respondWithData({ res, data, meta })
    } catch (err) {
      return respondWithError({ req, res, err, data: { type: "response data", method, path } })
    }
  })
}

export const respondWithError = function ({ req, res, err, data }) {
  let user_id = req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress
  let stack = parse_error_stack(err)
  let debug = parse_error_message(err)
  let message = stack.shift()
  let error = {
    ...data,
    user_id,
    message,
    debug
  }
  global.cconsole?.warn(`${data.method.toUpperCase()} ${data.path} ${debug} ${stack}`, req.query, req.body)
  return httpResponse(res, 500, error)
}

export const respondWithData = function ({ res, data, meta }) {
  return httpResponse(res, 200, data, meta)
}

export const httpResponse = function (res, res_status_code = 200, data = {}, meta = {}) {
  res.setHeader("Content-Type", "application/json")
  res.writeHead(Number(res_status_code) || 200)
  let output = {
    status:
      res_status_code === 200
        ? "success"
        : res_status_code >= 500 || ((!res_status_code || res_status_code < 500) && typeof data === "object")
        ? "error"
        : "fail",
    code: res_status_code,
    data,
    ...meta,
    hostname: global.hostname,
    hosttype: global.hosttype,
    dev: !!global.DEVELOPMENT,
    documentation: "https://documenter.getpostman.com/view/23360867/2s8YzXtewC"
  }
  res.write(JSON.stringify(output, null, "\t"))
  console.log("res.end()")
  res.end()
}
