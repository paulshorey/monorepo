import bing_spellcheck from "@ps/nlp/lib/promise/bing_spellcheck"
// import google_autocomplete from "@ps/nlp/api/3rdparty/promise/google_autocomplete"
// import bing_autosuggest from "@ps/nlp/api/3rdparty/promise/bing_autosuggest"
import stopwords_dict from "@techytools/constants/data/words/stopwords"
import sort_objects_by_property from "@techytools/fn/io/sort_objects/sort_objects_by_property"

let DEBUG1 = false
export default async function (string) {
  let output: any = { string: string, spellchecked: string, suggestions: [] }
  let string_spaces_count = string.split(" ").length
  let alts = []
  let raw: any = {}
  let wip: any = {}
  let requests = []
  let time_start = Date.now()
  // requests.push(google_autocomplete)
  // requests.push(bing_autosuggest)
  requests.push(bing_spellcheck)
  // requests.push(() => Promise.resolve(string))
  let responses: any = await Promise.all(
    requests.map(async (fnctn) => {
      return await fnctn(string)
    })
  )
  for (let response of responses) {
    let alternatives = []
    if (typeof response === "string" && response !== "") {
      // if (response === string) {
      //   /*
      //    *
      //    * ORIGINAL STRING
      //    *
      //    */
      //   alternatives = [response]
      // } else {
      /*
       *
       * BING SPELLCHECK
       *
       */
      alternatives = [response]
      raw["bing_spellcheck"] = response
      // }
    } else if (typeof response === "object") {
      /*
       *
       * BING/GOOGLE AUTOSUGGEST
       *
       */
      if (!response.key || !response.source) continue
      if (response.alts) {
        alternatives = response.alts
        raw[response.source + "_autosuggest"] = response.alts
      }
    }
    /*
     *
     * AGGREGATE SUGGESTIONS
     *
     */
    for (let phrase of alternatives) {
      let last_letter = string[string.length - 1]
      let word = phrase
      let remainder = ""

      // cut off remainder
      // if first/last character is same as input, then start/end on those indexes
      let end_spelled_i = word.lastIndexOf(last_letter + " ")
      if (word[0] === string[0] && end_spelled_i !== -1) {
        remainder = word.substr(end_spelled_i + 1).trim()
        word = word.substring(0, end_spelled_i + 1)
      }
      // if not spellcheck, but autocomplete adding extra words after a space
      let alt1 = alternatives[0]
      if (alt1 && word.substring(0, alt1.length + 1) === alt1 + " ") {
        remainder = word.substr(alt1.length + 1)
        word = alt1
      }

      // add
      alts.push({ word, remainder, phrase })
    }
  }

  /*
   * AGGREGATE AND RATE
   */
  wip.alts = {} // word
  wip.autocomplete = {} // phrase
  wip.related = {} // remainder
  for (let obj of alts) {
    // add suggested word (the part of it which is similar to the input)
    if (obj.word) {
      let start_score = obj.word.length
      wip.alts[obj.word] = (wip.alts[obj.word] || start_score) + 2
    }
    // stop if suggestion extra word is a stopword
    if (obj.remainder && stopwords_dict[obj.remainder]) {
      continue
    }
    if (obj.phrase) {
      let start_score = obj.phrase.length
      wip.alts[obj.phrase] = (wip.alts[obj.phrase] || start_score) + 1
    }
  }
  // fix rating
  for (let str in wip.alts) {
    let rating = wip.alts[str]
    // prefer results closest to length of input string
    rating -= Math.abs(str.length - string.length) * 7
    // except, first extra space is more than ok
    if (str.split(" ").length - string_spaces_count) {
      rating += 10
    }
    // prefer result from bing_spellcheck
    if (str === raw["bing_spellcheck"]) {
      rating += 50
    }
    wip.alts[str] = rating
  }
  // convert object to array of tuples
  output.suggestions = Object.entries(wip.alts)
  // ok
  if (output.suggestions[0] && output.suggestions[0][0]) {
    // sort
    sort_objects_by_property(output.suggestions, 1)
    // spellchecked
    let found = output.suggestions[0][0]
    if (Math.abs(found.length - string.length) < string.length * 0.5) {
      output.spellchecked = found
    }
  }

  /*
   * SPELLCHECK SUGGESTIONS
   */
  if (output.spellchecked !== string) {
    let spelled = output.spellchecked
    let spelled_no_spaces = spelled.replace(/ /g, "")
    let string_has_no_spaces = string.indexOf(" ") === -1
    output.suggestions = output.suggestions.map(function ([str, rating]) {
      // fix original spelling
      if (string_has_no_spaces) {
        if (str.length - 3 > string.length) {
          str = str.replace(string + " ", spelled + " ")
        }
      }
      // fix corrected spelling if used without spaces
      if (str.length - 3 > spelled_no_spaces.length) {
        str = str.replace(spelled_no_spaces + " ", spelled + " ")
      }
      return [str, rating]
    })
  }

  if (DEBUG1) {
    output.wip = wip
    output.raw = raw
  }
  output.time = Date.now() - time_start
  return output
}
