import wordbreak from "@ps/nlp/api/lib/words/wordbreak"
import spellcheck from "@ps/nlp/api/lib/words/spellcheck"
import wordchunk from "@ps/nlp/api/lib/words/wordchunk"
import row_model from "@ps/nlp/api/endpoints/data.words/function/row_model"
import spellcheck_wordbreak_wordchunk from "@ps/nlp/api/lib/words/spellcheck-wordbreak-wordchunk"

/**
 * Breaks string of characters into meaningful words with info,
 *    specifically for domain suggestions
 * @param {string} input_str - sld / input keyword or phrase
 * @param {string} tld - input_tlds_user[0]
 * @param {boolean} do_spellcheck - !!query.spell_check
 * @output {object}
 * @output.chunks_keys {array}
 * @output.chunks_rows {object}
 * @output.string_original {string}
 * @output.string {string}
 * @output.tld {string}
 * @output.options {object}
 * @output.bing_alts {array} - alternate phrases
 */
let DEBUG1 = false // high level inputs/outputs
export default async function (input_str, tld, do_spellcheck) {
  if (DEBUG1) global.cconsole.log("api/lib/words/chunk_string", input_str, tld)
  let output_arr
  let output_alts
  let output_str = input_str
  // try to break up really long str before sending to spellcheck
  if (output_str.length > 30) {
    output_str = ((await wordbreak(output_str)) || []).join(" ").replace(/[ ]+/g, " ")
  }
  if (DEBUG1) global.cconsole.log("AFTER wordbreak(), output_str = ", output_str)
  // parse str (if result is different than input, skip next step)
  // if (do_spellcheck) {
  let spelled_obj: any = await spellcheck(output_str)
  if (DEBUG1) global.cconsole.log("AFTER spellcheck(), spelled_obj = ", spelled_obj)
  if (spelled_obj) {
    if (spelled_obj.spellchecked && spelled_obj.spellchecked !== output_str) {
      output_str = spelled_obj.spellchecked
      output_arr = spelled_obj.spellchecked.split(/[ ]+/)
    }
    if (spelled_obj.suggestions) {
      output_alts = spelled_obj.suggestions.map((tuple) => tuple[0])
    }
  }
  // }
  // tokenize (if spellcheck did not do it already)
  if (!output_arr) {
    let broken: any = (await spellcheck_wordbreak_wordchunk(output_str, { spellcheck: false })) || {}
    output_arr = broken.chunks[0] || []
  }
  if (DEBUG1) global.cconsole.log("AFTER wordbreak(), output_arr = ", output_arr)

  // tokenize and get word info about every chunk
  // output is: {chunks_rows<object>, chunks_keys<array>}
  let output: any = await wordchunk(output_arr)

  // fix
  let flat = output.chunks_keys.flat()
  for (let key of flat) {
    if (key && !output.chunks_rows[key]) {
      output.chunks_rows[key] = row_model({ key })
    }
  }

  // format
  output.string_original = input_str
  output.string = output_str
  output.tld = tld
  output.options = {}
  output.bing_alts = output_alts || []

  return output
}
