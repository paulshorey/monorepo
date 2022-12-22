import strings_shuffle_first_last2 from "./strings_shuffle_first_last2";

describe("strings", () => {
  it("strings_shuffle_first_last2", () => {
    // shuffles array of strings so not too many consecutive have the same first letter or last letter
    // it allows maximum 2 items in a row with the same letter
    expect(
      strings_shuffle_first_last2([
        "adark", // ends in k        // starts with a
        "aspark", // ends in k       // starts with a
        "asterisk", // ends in k     // starts with a
        "aardvark", // ends in k     // starts with a
        "ark", // ends in k          // starts with a
        "shark", // ends in k
        "dark", // ends in k         // starts with d
        "donkey", //                 // starts with d
        "dragon", //                 // starts with d
        "doom", //                   // starts with d
        "mellon",
        "car",
        "few",
        "more",
        "words"
      ])
    ).toStrictEqual([
      "adark",
      "aspark",
      "donkey",
      "asterisk",
      "aardvark",
      "dragon",
      "ark",
      "shark",
      "doom",
      "dark",
      "mellon",
      "car",
      "few",
      "more",
      "words"
    ]);
  });
});
