import parse_error_message from "@ps/fn/io/err/parse_error_message"
import authIndex from "@ps/nlp/api/lib/auth"

const DEBUG1 = false

export const endpointHandler = function ({ expressApp, method, path, response, auth }) {
  expressApp[method](path, async function (req, res) {
    let timeStart = Date.now()
    global.res = res
    if (global.DEBUG_PATHS || DEBUG1) global.cconsole.info(`${method.toUpperCase()} ${path}`, req.query, req.body)
    // authenticate
    let authError = await authIndex({ req, auth })
    if (authError) {
      const err = `Authentication error: ${authError}`
      errorHandler({ err, req, res, method, path })
      throw err
    }
    // fetch data
    const data = await response({ req, res })
    // if data is an error, throw it
    if (data instanceof Error) {
      http_response(res, 500, data)
      throw data
    } else {
      let timeEnd = Date.now()
      let meta = {
        responseTime: timeEnd - timeStart
      }
      // return response
      http_response(res, 200, data, meta)
    }
  })
}

export const errorHandler = function ({ err, req, res, method, path }) {
  err.request = `${method.toUpperCase()} ${path}`
  err.user_id = req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress
  let arr = err.stack ? err.stack.split("\n") : [err.message]
  http_response(res, 500, arr[0], { method, path })
  // global.cconsole.error(`request(${err.request})`, `user(${err.user_id})`, `err(${arr[0]} / ${arr[1]})`)
  throw `request(${err.request}) user(${err.user_id}) err(${arr[0]} / ${arr[1]})`
}

export const http_response = function (response, status_code: number, data: any, meta?: any) {
  // always respond with JSON
  response.setHeader("Content-Type", "application/json")
  response.writeHead(Number(status_code) || 200)
  let output
  if (status_code >= 200 && status_code < 300) {
    // success
    output = {
      host: global["hostname"],
      status: "success",
      code: 200,
      ...meta,
      data: data
    }
  } else {
    // system "error" or user inputs "fail"ed
    output = {
      host: global["hostname"],
      status:
        status_code >= 500 || ((!status_code || status_code < 500) && typeof data === "object") ? "error" : "fail",
      code: data.code || status_code || 400,
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
