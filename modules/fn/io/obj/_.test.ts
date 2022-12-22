import {
  is_obj,
  obj_add,
  obj_clone,
  obj_first_value,
  obj_first_entry,
  obj_not_empty,
  obj_has_key,
  obj_keys_from_array
} from ".";

describe("obj", () => {
  it("obj_add", () => {
    const obj = { a: 1 };
    obj_add(obj, "b", 2);
    expect(obj).toEqual({ a: 1, b: 2 });
  });

  it("obj_clone", () => {
    let obj1 = { a: 1 };
    let obj2 = obj_clone(obj1);
    obj2.b = 2;
    expect(obj1).toEqual({ a: 1 });
  });

  it("obj_keys_from_array", () => {
    const arr = [1, 2, 3];
    const obj = obj_keys_from_array(arr);
    expect(obj).toEqual({
      1: true,
      2: true,
      3: true
    });
  });

  it("obj_has_key", () => {
    expect(obj_has_key(null, "")).toEqual(false);
    expect(obj_has_key({}, "")).toEqual(false);
    expect(obj_has_key({ one: 1 }, "two")).toEqual(false);
    expect(obj_has_key({ one: 1, two: 2 }, "two")).toEqual(true);
  });

  it("obj_not_empty", () => {
    expect(obj_not_empty(null)).toEqual(false);
    expect(obj_not_empty({})).toEqual(false);
    expect(obj_not_empty({ asdf: "asdf" })).toEqual(true);
  });

  it("obj_first_value", () => {
    const firstValue = obj_first_value({ key1: "val1", key2: "val2" });
    expect(firstValue).toEqual("val1");
  });

  it("obj_first_entry", () => {
    const firstItem = obj_first_entry({ key1: "val1", key2: "val2" });
    expect(firstItem?.[0]).toEqual("key1");
    expect(firstItem?.[1]).toEqual("val1");
  });

  it("is_obj", () => {
    expect(is_obj(null)).toEqual(false);
    expect(is_obj({})).toEqual(true);
  });
});
