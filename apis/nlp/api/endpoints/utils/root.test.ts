import test from "node:test"
import assert from "node:assert/strict"
import "../../global.js"
import api from "./deploy"

test("response", () => {
  let response = api[0].response({ req: {} })
  assert.strictEqual(response, {
    message: "Github Hook received!",
    query: {},
    body: {}
  })
})
