import sort_strings_by_rating from "./sort_strings_by_rating";

describe("sort_strings_by_width", () => {
  const arr = ["a", "c", "b", "f", "d", "e", "g"];
  const ratings = {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
    f: 5,
    g: 6,
    h: 7,
    i: 8,
    j: 9,
    k: 10,
    l: 11,
    m: 12,
    n: 13,
    o: 14,
    p: 15,
    q: 16,
    r: 17,
    s: 18,
    t: 19,
    u: 20,
    v: 21,
    w: 22,
    x: 23,
    y: 24,
    z: 25
  };

  it("sorts correctly (higher rating = first in list)", () => {
    expect(sort_strings_by_rating(arr, ratings)).toEqual(["g", "f", "e", "d", "c", "b", "a"]);
  });

  it("didn't change the original order", () => {
    expect(arr).toEqual(["a", "c", "b", "f", "d", "e", "g"]);
  });
});
