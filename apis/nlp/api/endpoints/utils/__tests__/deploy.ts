import api from "@ps/nlp/api/endpoints/utils/deploy"

describe("/deploy", () => {
  it("returns correct response", async () => {
    let response = api[0].response({ req: { query: {}, body: {} } })
    expect(response).toStrictEqual({
      body: {},
      message: "Github Hook received!",
      query: {}
    })
  })
})
