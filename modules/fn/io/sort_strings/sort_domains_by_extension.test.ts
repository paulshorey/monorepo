import sort_domains_by_extension from "./sort_domains_by_extension";

describe("sort_domains_by_extension", () => {
  const arr = [
    "astrobin.ws",
    "lalalalala.la",
    "something.in",
    "artspaces.net",
    "www.google.co.uk",
    "www.google.co.jp",
    "www.google.com",
    "www.google.co.in",
    "www.google.co.nz",
    "paulshorey.com"
  ];
  const ext = ["com", "net", "uk", "jp", "in", "nz", "ws", "la"];
  let sorted = sort_domains_by_extension(arr, ext);

  it("sorts correctly", () => {
    expect(sorted).toEqual([
      "www.google.com",
      "paulshorey.com",
      "artspaces.net",
      "www.google.co.uk",
      "www.google.co.jp",
      "something.in",
      "www.google.co.in",
      "www.google.co.nz",
      "astrobin.ws",
      "lalalalala.la"
    ]);
  });

  it("did not modify original array", () => {
    expect(arr).toEqual([
      "astrobin.ws",
      "lalalalala.la",
      "something.in",
      "artspaces.net",
      "www.google.co.uk",
      "www.google.co.jp",
      "www.google.com",
      "www.google.co.in",
      "www.google.co.nz",
      "paulshorey.com"
    ]);
  });
});
