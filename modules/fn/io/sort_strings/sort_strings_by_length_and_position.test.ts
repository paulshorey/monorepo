import sort_strings_by_length_and_position from "./sort_strings_by_length_and_position";

describe("sort_strings_by_length_and_position", () => {
  const arr = [
    "astroturf.design",
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

  it("sorts correctly - keeping current position as much as possible", () => {
    expect(sort_strings_by_length_and_position(arr)).toEqual([
      "google.uk",
      "google.jp",
      "something.in",
      "lalalalala.la",
      "google.in",
      "google.com",
      "google.nz",
      "artspaces.net",
      "astroturf.design",
      "paulshorey.com"
    ]);
  });

  it("sorts agressively - prefering the length over existing position", () => {
    expect(sort_strings_by_length_and_position(arr, 0.5)).toEqual([
      "google.uk",
      "google.jp",
      "google.in",
      "google.nz",
      "google.com",
      "something.in",
      "lalalalala.la",
      "artspaces.net",
      "astroturf.design",
      "paulshorey.com"
    ]);
  });

  it("did not modify original array", () => {
    expect(arr).toEqual([
      "astroturf.design",
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
