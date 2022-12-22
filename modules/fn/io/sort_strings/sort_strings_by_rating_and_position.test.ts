import sort_strings_by_rating_and_position from "./sort_strings_by_rating_and_position";

describe("sort_strings_by_rating_and_position", () => {
  const ratings = {
    "astrobin.ws": 1,
    "lalalalala.la": 2,
    "something.in": 15,
    "artspaces.net": 50,
    "google.co.uk": 25,
    "google.co.jp": 25,
    "google.com": 100,
    "google.co.in": 15,
    "google.co.nz": 5,
    "paulshorey.com": 100
  };
  let arr = Object.keys(ratings);

  it("sorts - by default tries not to change position too much", () => {
    expect(sort_strings_by_rating_and_position(arr, ratings)).toEqual([
      "google.com",
      "artspaces.net",
      "astrobin.ws",
      "paulshorey.com",
      "something.in",
      "lalalalala.la",
      "google.co.uk",
      "google.co.jp",
      "google.co.in",
      "google.co.nz"
    ]);
  });

  it("sorts aggressively - caring more about rating than position", () => {
    expect(sort_strings_by_rating_and_position(arr, ratings, 0.5)).toEqual([
      "google.com",
      "paulshorey.com",
      "artspaces.net",
      "something.in",
      "google.co.uk",
      "astrobin.ws",
      "google.co.jp",
      "lalalalala.la",
      "google.co.in",
      "google.co.nz"
    ]);
  });

  it("did not modify original array", () => {
    expect(arr).toEqual([
      "astrobin.ws",
      "lalalalala.la",
      "something.in",
      "artspaces.net",
      "google.co.uk",
      "google.co.jp",
      "google.com",
      "google.co.in",
      "google.co.nz",
      "paulshorey.com"
    ]);
  });
});
