// @ts-nocheck // tsFix - this whole file is experimental, needs refactor!
/**
 * Shuffle list of strings
 *    do not allow two strings to repeat which have the same first letter or same last letter
 * @params strs {array} - array of strings
 * @returns {array} - new array (immutable), of shuffled strs
 */
export default function strings_shuffle_last2(input_strs: string[] = []): Array<string> {
  let memory_strs = [];
  let unique_strs = [];

  // console.time("1000 loops")
  let loops = 0;
  let old_strs = "";
  infinite_loop: while (loops < 1000) {
    loops++;

    // don't waste time on the same value
    let new_strs = input_strs[0] + memory_strs[0] + unique_strs[0];
    if (new_strs === old_strs) {
      break infinite_loop;
    }
    old_strs = new_strs;

    // no more inputs
    if (!input_strs.length && !memory_strs.length) {
      break infinite_loop;
    }

    // first time
    if (!unique_strs.length) {
      unique_strs.push(input_strs.shift());
      continue infinite_loop;
    }

    // last added string
    let unique_str = unique_strs[unique_strs.length - 1] || ""; // last added
    let unique_str_ll = unique_str[unique_str.length - 1] || "";

    let unique_str2 = unique_strs[unique_strs.length - 2] || ""; // 2nd to last added
    let unique_str2_ll = unique_str2[unique_str2.length - 1] || "";

    // insert new str
    // from memory
    if (memory_strs.length) {
      for (let str of memory_strs) {
        if (!str) continue;
        let str_ll = str[str.length - 1];
        if (str_ll === unique_str_ll && str_ll === unique_str2_ll) {
          // not unique
          continue;
        } else {
          // add unique
          unique_strs.push(memory_strs.shift());
          continue infinite_loop;
        }
      }
    }

    // insert new str
    // from input
    if (input_strs[0]) {
      let str = input_strs.shift();
      let str_ll = str[str.length - 1];
      if (str_ll === unique_str_ll && str_ll === unique_str2_ll) {
        // not unique
        memory_strs.push(str);
      } else {
        // add unique
        unique_strs.push(str);
      }
    }
  }
  // console.timeEnd("1000 loops")

  return [...unique_strs, ...memory_strs, ...input_strs];
}
