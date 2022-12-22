import aggregate_req_body_query_params from "./aggregate_req_body_query_params";

describe("req", () => {
  it("aggregate_req_body_query_params", () => {
    let req = {
      body: {
        a: 1
      },
      query: {
        b: 2
      },
      params: {
        c: 3
      }
    };
    const obj = aggregate_req_body_query_params(req);
    expect(obj.a).toBe(1);
    expect(obj.b).toBe(2);
    expect(obj.c).toBe(3);
  });
});
