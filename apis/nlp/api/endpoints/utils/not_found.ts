/*
 * THIS MUST BE CALLED LAST - AFTER ALL OTHER ENDPOINTS
 */
export default [
  {
    method: "get",
    path: "*",
    response: ({ res }) => {
      res.status(404)
      let err = "Could not find API"
      global.cconsole?.error(`*`, err)
      return err
    }
  }
]
