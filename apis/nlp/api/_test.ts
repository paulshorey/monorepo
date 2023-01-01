import initGlobal from "@ps/nlp/lib/global"

describe("global", () => {
  it("import and instantiate global constants and services without errors", async () => {
    await initGlobal({ NO_ASYNC: true })
  })
})

describe("Google invisible captcha", () => {
  it("call to Google to get recaptcha handshake", async () => {})
})
