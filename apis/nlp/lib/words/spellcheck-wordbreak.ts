import wordbreak from "./wordbreak"
import spellcheck from "./spellcheck"

export default async function (input_str, options: any = {}) {
  let do_spellcheck = "spellcheck" in options ? options.spellcheck : true
  let output_arr
  let output_str = input_str
  // spellcheck first
  if (do_spellcheck) {
    // try to break up really long str before sending to spellcheck
    if (output_str.length > 30) {
      output_str = ((await wordbreak(output_str)) || []).join(" ").replace(/[ ]+/g, " ")
    }
    // parse str (if result is different than input, skip next step)
    let obj: any = await spellcheck(output_str)
    if (obj && obj.spellchecked && obj.spellchecked !== output_str) {
      output_str = obj.spellchecked
      output_arr = obj.spellchecked.split(/[ ]+/)
    }
  }
  // tokenize (if spellcheck did not do it already)
  if (!output_arr) {
    output_arr = (await wordbreak(output_str)) || []
  }
  // done
  return output_arr
}
