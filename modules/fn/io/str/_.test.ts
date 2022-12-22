import str_hash from "./str_hash";
import str_capitalize from "./str_capitalize";
import str_sanitize from "./str_sanitize";
import base64_decode from "./base64_decode";
import base64_encode from "./base64_encode";
import str_to_camel_case from "./str_to_camel_case";

describe("base64_encode", () => {
  it("can encode properly", () => {
    const result = base64_encode("hello");
    expect(result).toBe("aGVsbG8=");
  });
  it("does not error on invalid arg, returns empty string", () => {
    // @ts-ignore
    const result = base64_encode(9);
    expect(result).toBe("");
  });
});

describe("base64_decode", () => {
  it("can decode properly", () => {
    const result = base64_decode("aGVsbG8=");
    expect(result).toBe("hello");
  });
  it("does not error on invalid arg, returns empty string", () => {
    // @ts-ignore
    const result = base64_decode(9);
    expect(result).toBe("");
  });
});

describe("str", () => {
  it("str_to_camel_case", () => {
    expect(str_to_camel_case("few words separated by spaces")).toBe("fewWordsSeparatedBySpaces");
  });

  it("str_hash", () => {
    expect(str_hash("californiacation")).toBe("-671277782");
    expect(str_hash("dance")).toBe("95350707");
  });

  it("str_capitalize", () => {
    expect(str_capitalize("pauly shore")).toBe("Pauly Shore");
  });

  it("str_sanitize", () => {
    expect(str_sanitize(" trim-and_remove_Special-Characters!@#$%^&*()_+1234567890 ")).toBe(
      "trim-and_remove_special-characters_1234567890"
    );
    expect(
      str_sanitize(" trim-and_remove_Special-Characters!@#$%^&*()_+1234567890 ", {
        allowChars: "\\w\\-_\\$\\!",
        allowUppercase: true
      })
    ).toBe("trim-and_remove_Special-Characters!$_1234567890");
    expect(
      str_sanitize(" trim-and_remove_Special-Characters!@#$%^&*()_+1234567890 ", {
        allowChars: "a-zA-Z"
      })
    ).toBe("trimandremovespecialcharacters");
  });
});
