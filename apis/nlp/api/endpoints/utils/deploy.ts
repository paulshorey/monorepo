import * as child_process from "child_process"

export default [
  {
    method: "all",
    path: "/_deploy",
    response: ({ req }) => {
      global.cconsole.warn(
        `bash ${global.__root}/_bash/_start_production.sh`,
        `DEVELOPMENT ?= ${global["DEVELOPMENT"]}`
      )
      // ONLY enabled in production/staging
      if (!global["DEVELOPMENT"]) {
        child_process.exec(`bash ${global.__root}/_bash/_start_production.sh`)
      }
      return {
        message: "Github Hook received!",
        query: req.query,
        body: req.body
      }
    }
  }
]
