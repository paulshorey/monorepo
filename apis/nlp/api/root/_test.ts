import request from "supertest"
import { Express } from "express-serve-static-core"
import initApp from "@ps/nlp/api/express"
import initGlobal from "@ps/nlp/lib/global"

initGlobal({ NO_ASYNC: true, NO_LOGS: true })
let server: Express
beforeAll(function () {
  server = initApp()
})

describe("api/utils/_test", () => {
  {
    const path = "/"
    it("GET " + path, async () => {
      const response = await request(server).get(path)
      expect(response.body.data.greetings[0]).toEqual("hi")
    })
  }
  {
    const path = "/_deploy"
    it("GET " + path, async () => {
      const response = await request(server).get(path)
      expect(response.body.data).toStrictEqual({
        body: {},
        message: "Github Hook received!",
        query: {}
      })
    })
  }
})
