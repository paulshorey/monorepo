import initGlobal from "@ps/nlp/lib/global"

describe("api/_test", () => {
  it("import and instantiate global constants and services without errors", async () => {
    await initGlobal({ NO_ASYNC: true })
  })
  // it("call to Google to get recaptcha handshake", async () => {})
})
