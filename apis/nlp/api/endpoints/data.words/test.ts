import request from "supertest"
import { Express } from "express-serve-static-core"
import initApp from "@ps/nlp/api/app"
import initGlobal from "@ps/nlp/lib/global"

initGlobal({ NO_ASYNC: true, NO_LOGS: true })
let server: Express
beforeAll(function () {
  server = initApp()
})

describe("endpoints data.words", () => {
  {
    const path = "/api/data/word/hello"
    it("GET " + path, async () => {
      const response = await request(server).get(path)
      // global.cconsole.log("response.body", response.body)
      expect(response.body.data.dict["good afternoon"]).toBeTruthy()
    })
  }
  {
    const path = "/api/data/domain_extensions/tech"
    it("GET " + path, async () => {
      const response = await request(server).get(path)
      // global.cconsole.log("response.body.data", response.body.data)
      expect(response.body.data?.[0]).toEqual("tech")
    })
  }
})
