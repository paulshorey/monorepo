import sort_strings_by_length from "./sort_strings_by_length";

describe("sort_strings_by_length", () => {
  const arr = [
    "astrobin.ws",
    "lalalalala.la",
    "something.in",
    "artspaces.net",
    "google.uk",
    "google.jp",
    "google.com",
    "google.in",
    "google.nz",
    "paulshorey.com"
  ];

  it("sorts ascending", () => {
    expect(sort_strings_by_length(arr)).toEqual([
      "google.uk", // if strings are exact same length, will keep original order
      "google.jp",
      "google.in",
      "google.nz",
      "google.com",
      "astrobin.ws",
      "something.in",
      "lalalalala.la",
      "artspaces.net",
      "paulshorey.com"
    ]);
  });

  it("sorts descending", () => {
    expect(sort_strings_by_length(arr, true)).toEqual([
      "paulshorey.com",
      "lalalalala.la",
      "artspaces.net",
      "something.in",
      "astrobin.ws",
      "google.com",
      "google.uk",
      "google.jp",
      "google.in",
      "google.nz" // if strings are exact same length, will keep original order
    ]);
  });

  it("did not modify original array", () => {
    expect(arr).toEqual([
      "astrobin.ws",
      "lalalalala.la",
      "something.in",
      "artspaces.net",
      "google.uk",
      "google.jp",
      "google.com",
      "google.in",
      "google.nz",
      "paulshorey.com"
    ]);
  });
});
