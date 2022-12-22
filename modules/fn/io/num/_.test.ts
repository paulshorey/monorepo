import { average, mean, is_number } from ".";

describe("num", () => {
  it("average", () => {
    expect(average([1, 2, 3, 3, 2, 1])).toBe(2);
  });

  it("mean", () => {
    expect(mean([1, 2, 2, 2, 2, 100000])).toBe(2);
  });

  it("is_number", () => {
    expect(is_number("1")).toBe(true);
    expect(is_number("1.12345")).toBe(true);
    expect(is_number("1%12345")).toBe(false);
  });
});
