import json_stringify from "./json_stringify";
import json_parse from "./json_parse";
import { obj_not_empty, is_obj } from "../obj";

describe("json", () => {
  it("json_stringify", () => {
    let json_stringifyObject = json_stringify({ one: 1 }) || "";
    expect(json_stringifyObject).toBe('{"one":1}');
    let json_stringifyEmptyObject = json_stringify({});
    expect(json_stringifyEmptyObject).toEqual("{}");
  });
  it("json_parse", () => {
    let json_parseObject = json_parse('{"one":1}') as Record<string, any>;
    let json_parseEmptyObject = json_parse("{}") as Record<string, any>;
    expect(json_parseObject?.one).toEqual(1);
    expect(is_obj(json_parseEmptyObject) && !obj_not_empty(json_parseEmptyObject)).toEqual(true);
    expect(json_parse("null")).toEqual(null);
    expect(json_parse("2")).toEqual(2);
    expect(json_parse("false")).toEqual(false);
    expect(json_parse("true")).toEqual(true);
    expect(json_parse("undefined")).toEqual(undefined);
    expect(json_parse("JSON")).toEqual("JSON");
  });
});
