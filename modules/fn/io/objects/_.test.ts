import objects_are_equal from "./objects_are_equal";
import objects_add_values from "./objects_add_values";
import objects_merge_keys from "./objects_merge_keys";

describe("objects", () => {
  it("objects_add_values", () => {
    expect(objects_add_values(null, undefined)).toStrictEqual(null);
    expect(objects_add_values({ a: 1 }, { z: 2 })).toStrictEqual({ a: 1, z: 2 });
    expect(objects_add_values({ a: "123" }, { a: "456" })).toStrictEqual({ a: "456" });
    expect(objects_add_values({ a: "display:block" }, { a: "padding:1rem" }, ";", undefined, ["a"])).toStrictEqual({
      a: "display:block;padding:1rem"
    });
    expect(objects_add_values({ a: null }, { a: "padding:1rem" }, ";", undefined, ["a"])).toStrictEqual({
      a: "padding:1rem"
    });
    expect(objects_add_values({ a: 1 }, { a: true })).toStrictEqual({ a: true });
    expect(objects_add_values({ a: 1, z: true }, { a: 2, z: false })).toStrictEqual({ a: 2, z: false });
    expect(objects_add_values([1, 2, 3], [4, 5, 6])).toStrictEqual([1, 2, 3, 4, 5, 6]);
    expect(objects_add_values({ a: () => 1 }, { a: () => 2 }).a()).toStrictEqual(2);
  });

  it("objects_are_equal", () => {
    const objct = { two: 2 };
    const funct = () => 25;
    const person1 = {
      str: ":)",
      obj: { a: 1 },
      objRef: objct,
      funct
    };
    const person2 = {
      str: ":)",
      obj: { a: 1 },
      objRef: objct,
      funct
    };
    expect(objects_are_equal(person1, person2)).toBe(true);
    // @ts-ignore
    person1.extra = "extra";
    expect(objects_are_equal(person1, person2)).toBe(false);
    // @ts-ignore
    person2.extra = () => {};
    expect(objects_are_equal(person1, person2)).toBe(false);
    // @ts-ignore
    person2.extra = "extra";
    expect(objects_are_equal(person1, person2)).toBe(true);
  });

  it("objects_merge_keys", () => {
    const obj1 = { one: 1 };
    const obj2 = { two: 2 };
    const obj = objects_merge_keys(obj1, obj2);
    expect(obj.one).toEqual(1);
    expect(obj.two).toEqual(2);
  });
});
