import api from "@ps/nlp/api/endpoints/utils/root"

describe("/", () => {
  it("returns correct response", async () => {
    let response = api[0].response()
    expect(response.greetings[0]).toEqual("hi")
  })
})
