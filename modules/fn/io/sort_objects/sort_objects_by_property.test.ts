import sort_objects_by_property from "./sort_objects_by_property";

describe("sort_objects_by_property", () => {
  const arr = [{ key: 3 }, { key: 1 }, { key: 2 }];

  it("sorts correctly", () => {
    expect(sort_objects_by_property(arr, "key")).toEqual([{ key: 1 }, { key: 2 }, { key: 3 }]);
  });

  it("did not modify original array", () => {
    expect(arr).toEqual([{ key: 3 }, { key: 1 }, { key: 2 }]);
  });
});
