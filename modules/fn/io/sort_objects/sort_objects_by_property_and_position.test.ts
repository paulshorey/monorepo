import sort_objects_by_property_and_position from "./sort_objects_by_property_and_position";

describe("sort_objects_by_property_and_position", () => {
  const arr = [
    { key: 3 },
    { key: 3 },
    { key: 4 },
    { key: 4 },
    { key: 1 },
    { key: 1 },
    { key: 2 },
    { key: 2 },
    { key: 5 },
    { key: 5 },
    { key: 6 },
    { key: 6 }
  ];

  it("sorts correctly - keeping current position as much as possible", () => {
    expect(sort_objects_by_property_and_position(arr, "key")).toEqual([
      {
        key: 4
      },
      {
        key: 3
      },
      {
        key: 4
      },
      {
        key: 3
      },
      {
        key: 6
      },
      {
        key: 5
      },
      {
        key: 6
      },
      {
        key: 5
      },
      {
        key: 2
      },
      {
        key: 1
      },
      {
        key: 2
      },
      {
        key: 1
      }
    ]);
  });

  it("sorts agressively - prefering the rating (key) over existing position", () => {
    expect(sort_objects_by_property_and_position(arr, "key", 0.5)).toEqual([
      {
        key: 6
      },
      {
        key: 4
      },
      {
        key: 6
      },
      {
        key: 4
      },
      {
        key: 5
      },
      {
        key: 3
      },
      {
        key: 5
      },
      {
        key: 3
      },
      {
        key: 2
      },
      {
        key: 2
      },
      {
        key: 1
      },
      {
        key: 1
      }
    ]);
  });

  it("did not modify original array", () => {
    expect(arr).toEqual([
      { key: 3 },
      { key: 3 },
      { key: 4 },
      { key: 4 },
      { key: 1 },
      { key: 1 },
      { key: 2 },
      { key: 2 },
      { key: 5 },
      { key: 5 },
      { key: 6 },
      { key: 6 }
    ]);
  });
});
