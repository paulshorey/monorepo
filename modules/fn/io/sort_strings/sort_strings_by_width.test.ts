import sort_strings_by_width from "./sort_strings_by_width";

describe("sort_strings_by_width", () => {
  /**
   * Here, width is not visible in mono-spaced font. This is meant for renering text in a browser.
   * l = skinny, 0 = medium, w = wide
   */
  const arr = ["00000000", "llllllll", "wwwwwwww"];

  it("sorts ascending", () => {
    expect(sort_strings_by_width(arr)).toEqual(["llllllll", "00000000", "wwwwwwww"]);
  });

  it("sorts descending", () => {
    expect(sort_strings_by_width(arr, true)).toEqual(["wwwwwwww", "00000000", "llllllll"]);
  });

  it("didn't change the original order", () => {
    expect(arr).toEqual(["00000000", "llllllll", "wwwwwwww"]);
  });
});
