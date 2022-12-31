export default [
  {
    method: "all",
    path: "/_deploy",
    response: ({ req }) => {
      // ONLY RUN IF PRODUCTION/STAGING
      if (!global["DEVELOPMENT"]) {
        global.cconsole?.warn(`DEPLOYING bash ${global.__root}/_bash/_start_production.sh`)
        // child_process.exec(`bash ${global.__root}/_bash/_start_production.sh`)
      }
      return {
        message: "Github Hook received!",
        query: req.query,
        body: req.body
      }
    }
  }
]
