import try_catch from "./try_catch";
import parse_error_message from "./parse_error_message";

describe("try_catch", () => {
  it("catches the error", () => {
    let error = "";
    try_catch(
      () => {
        throw new Error("try_catch caught this error so code execution can continue");
      },
      (err: Error) => {
        error = err.message.split("\n")[0];
      }
    );
    expect(error).toBe("try_catch caught this error so code execution can continue");
  });
});

describe("parse_error_message", () => {
  it("simple text", () => {
    let str = parse_error_message("simple text message");
    expect(str).toBe("simple text message");
  });
  it("JS error object", () => {
    let str = parse_error_message(new Error("JavaScript error object"));
    expect(str).toBe("JavaScript error object");
  });
  it("network error", () => {
    let str = parse_error_message({ data: { error: { message: "invalid command" } } });
    expect(str).toBe("invalid command");
  });
  it("network errors", () => {
    let str = parse_error_message({ data: { errors: ["invalid command 1", "invalid command 2"] } });
    expect(str).toBe("invalid command 1");
  });
  it("network data text", () => {
    let str = parse_error_message({ data: "just some text" });
    expect(str).toBe("just some text");
  });
  it("network error text", () => {
    let str = parse_error_message({ error: "error text" });
    expect(str).toBe("error text");
  });
  it("network warning text", () => {
    let str = parse_error_message({ warning: "warning text" });
    expect(str).toBe("warning text");
  });
  it("not a real error but an unexpected data format", () => {
    let str = parse_error_message({ this: { aint: { right: false } } });
    expect(str).toBe('Error 33: {"this":{"aint":{"right...');
  });
});
