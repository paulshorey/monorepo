import test from "node:test"
import assert from "node:assert/strict"
import "../../global.js"
import api from "./root"

test("response", () => {
  let response = api[0].response()
  assert.strictEqual(response.greetings[0], "hi")
})
