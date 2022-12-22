import syllable_count from "./syllable_count";
import ends_in_vowel from "./ends_in_vowel";
import word_width from "./word_width";
import is_vowel from "./is_vowel";

describe("word", () => {
  it("syllable_count", () => {
    expect(syllable_count("californiacation")).toBe(6);
    expect(syllable_count("juxtapose")).toBe(3);
    expect(syllable_count("taupe")).toBe(1);
  });

  it("ends_in_vowel (including silent e)", () => {
    expect(ends_in_vowel("taupe")).toBe(true);
  });

  it("word_width", () => {
    expect(word_width("es5")).toBe(5 + 6 + 7);
  });

  it("is_vowel", () => {
    expect(is_vowel("e")).toBe(true);
    expect(is_vowel("E")).toBe(true);
    expect(is_vowel("c")).toBe(false);
  });
});
