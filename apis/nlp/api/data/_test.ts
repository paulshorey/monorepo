import request from "supertest"
import { Express } from "express-serve-static-core"
import initApp from "@ps/nlp/api/express"
import initGlobal from "@ps/nlp/lib/global"

initGlobal({ NO_ASYNC: true, NO_LOGS: true })
let server: Express
beforeAll(function () {
  server = initApp()
})

describe("api/data/_test", () => {
  {
    const path = "/data/word/hello"
    it("GET " + path, async () => {
      const response = await request(server).get(path)
      global.cconsole.log("response.body", response.body)
      expect(response.body.data.dict["good afternoon"]).toBeTruthy()
    })
  }
})
