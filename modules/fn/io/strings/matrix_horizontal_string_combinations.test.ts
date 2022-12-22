import matrix_horizontal_string_combinations from "./matrix_horizontal_string_combinations";

describe("strings", () => {
  // this needs more thought
  it("matrix_horizontal_string_combinations", () => {
    expect(matrix_horizontal_string_combinations([[1], [1, 2], [1, 2, 3]])).toStrictEqual([
      "1 1 1",
      "1 2 1",
      "1 1 2",
      "1 2 2",
      "1 1 3",
      "1 2 3"
    ]);
  });
});
