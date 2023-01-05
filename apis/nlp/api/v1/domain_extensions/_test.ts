import request from "supertest"
import { Express } from "express-serve-static-core"
import initApp from "@ps/nlp/api/initApp"
import initGlobal from "@ps/nlp/lib/global"

initGlobal({ NO_ASYNC: true, NO_LOGS: true })
let server: Express
beforeAll(function () {
  server = initApp()
})

describe("api/v1/domain_extensions/_test", () => {
  {
    const path = "/v1/domain_extensions/tech"
    it("GET " + path, async () => {
      const response = await request(server).get(path)
      // global.cconsole.log("response.body.data", response.body.data)
      expect(response.body.data?.[0]).toEqual("tech")
    })
  }
})
