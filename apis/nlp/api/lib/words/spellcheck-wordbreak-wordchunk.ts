import spellcheckWordbreak from "./spellcheck-wordbreak"
import wordchunk from "./wordchunk"
/**
 * @param {string} input_str
 * @output {object}
 */
export default async function (input_str, options: any = {}) {
  let output: any = {
    string: input_str,
    keys: input_str
  }

  // sanitize input
  input_str = input_str.split(".")[0]
  // input_str = input_str.replace(/"+/g, " ")
  // input_str = input_str.replace(/[^\d\p{L}\-_]+/gu, " ").trim()

  // spellcheck and wordbreak
  let word_arr: any = await spellcheckWordbreak(input_str, options)

  // tokenize and get word info about every chunk
  let parsed: any = await wordchunk(word_arr)

  // format
  if (parsed.chunks_keys && parsed.chunks_keys.length) {
    output.keys = parsed.chunks_keys[parsed.chunks_keys.length - 1].join(" ")
  } else {
    output.keys = word_arr.join(" ")
  }

  // done
  return { ...output, ...parsed }
}
