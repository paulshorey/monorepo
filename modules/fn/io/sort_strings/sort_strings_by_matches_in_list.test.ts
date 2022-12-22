import sort_strings_by_matches_in_list from "./sort_strings_by_matches_in_list";

describe("sort_strings_by_matches_in_list", () => {
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
  const match = ["google", "paul", "shorey"];

  it("sorts ascending", () => {
    expect(sort_strings_by_matches_in_list(arr, match)).toEqual([
      "paulshorey.com",
      "google.uk",
      "google.jp",
      "google.com",
      "google.in",
      "google.nz",
      "astrobin.ws",
      "lalalalala.la",
      "something.in",
      "artspaces.net"
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
