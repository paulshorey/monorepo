import initGlobals from "@ps/nlp/api/global"

describe("*", () => {
  it("import and instantiate /api/global constants and services without error", async () => {
    initGlobals({ disableAsync: true })
  })
})
