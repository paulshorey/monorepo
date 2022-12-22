import arrays_merge from "./arrays_merge";
import arrays_mix from "./arrays_mix";
import arrays_diff from "./arrays_diff";
import arrays_subtract from "./arrays_subtract";

describe("arrays_mix", () => {
  let arr1 = ["a", "b", "c"];
  let arr2 = [1, 2, 3];
  it("mixes two arrays", () => {
    expect(arrays_mix([arr1, arr2])).toEqual(["a", 1, "b", 2, "c", 3]);
  });
  it("does not modify original arrays", () => {
    expect(arr1).toEqual(["a", "b", "c"]);
    expect(arr2).toEqual([1, 2, 3]);
  });
});

describe("arrays_diff", () => {
  let arr1 = [1, 2, 3, 4, 5, 6, 7];
  let arr2 = [4, 5, 6, 7, 8, 9];
  it("keeps only unique values", () => {
    let diff = arrays_diff(arr1, arr2);
    expect(diff).toEqual([1, 2, 3, 8, 9]);
  });
  it("does not modify original arrays", () => {
    expect(arr1).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(arr2).toEqual([4, 5, 6, 7, 8, 9]);
  });
});

describe("arrays_subtract", () => {
  let arr1 = [1, 2, 3, 4, 5, 6, 7];
  let arr2 = [4, 5, 6, 7, 8, 9];
  it("removes arrB values from arrA", () => {
    let result = arrays_subtract(arr1, arr2);
    expect(result).toEqual([1, 2, 3]);
  });
  it("does not modify original arrays", () => {
    expect(arr1).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(arr2).toEqual([4, 5, 6, 7, 8, 9]);
  });
});

describe("arrays_merge", () => {
  const arr1 = ["a", "b", "z", "t"];
  const arr2 = ["a", "z", "b", "c"];
  it("combines array values, ignoring duplicates", () => {
    expect(arrays_merge(arr1, arr2)).toEqual(["a", "b", "z", "t", "c"]);
  });
  it("does not modify original arrays", () => {
    expect(arr1).toEqual(["a", "b", "z", "t"]);
    expect(arr2).toEqual(["a", "z", "b", "c"]);
  });
});
