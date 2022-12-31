import request from "supertest"
import { Express } from "express-serve-static-core"
import initApp from "@ps/nlp/api/app"
import initGlobal from "@ps/nlp/lib/global"

initGlobal({ NO_ASYNC: true, NO_LOGS: false })
let server: Express
beforeAll(function () {
  server = initApp()
})

describe("endpoints domain_suggestions", () => {
  {
    const path = "/v1/suggestions?str=hello.world"
    it("GET " + path, async () => {
      const response = await request(server).get(path)
      // global.cconsole.log("response.body", response.body)
      expect(response.body.data.tld).toBeTruthy()
      expect(response.body.data.domains).toBeTruthy()
    })
  }
})
