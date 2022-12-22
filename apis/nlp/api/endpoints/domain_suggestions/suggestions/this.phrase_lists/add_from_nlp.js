import from_simple_mstring from "@ps/nlp/api/endpoints/domain_suggestions/suggestions/this.phrase_lists/phrase_list/markov_string_simple"
// import self_before_after from "@ps/nlp/api/endpoints/domain_suggestions/suggestions/this.phrase_lists/phrase_list/self_before_after"
/**
 * Make Phrase Suggestions Lists
 * @modifies this {object}
 * @modifies this.tlds {array} - list of domain extensions
 * @modifies this.phrase_lists {object} - work in progress dict of lists of phrase lists
 * @modifies this.phrases {array} - work in progress list of phrases
 * @modifies this.lists {object} - work in progress dict of lists of phrase strings
 */
const DEBUG1 = false
export default function make_lists() {
  let { chunks_dict, chunks_keys } = this
  if (DEBUG1) {
    console.log(
      "chunks_keys",
      chunks_keys.map((str) => {
        return [
          str,
          chunks_dict[str].pos1 + "(" + chunks_dict[str].poss[chunks_dict[str].pos1].length + ")",
          chunks_dict[str].pos2 + "(" + chunks_dict[str].poss[chunks_dict[str].pos2].length + ")"
        ]
      })
    )
  }
  /*
   * MarkovStrings - simple pairs
   * (only use the first 2 successful lists)
   */
  let lists_added = 0
  let pairs = [
    ["adj", "nou"],
    ["int", "nou"],
    ["int", "int"],
    ["int", "pre"],
    ["int", "pro"],
    ["pro", "ver"],
    ["pre", "ver"],
    ["pro", "adv"],
    ["ver", "adv"],
    ["ver", "nou"],
    ["etc", "nou"],
    ["adv", "ver"],
    ["nou", "nou"]
  ]
  for (let pair of pairs) {
    // what to call this list
    let listname = `${pair[0]}`
    // make list
    let list = from_simple_mstring.call(this, pair[0], pair[1], chunks_keys)
    if (list && list.length) {
      // make list
      if (!this.phrase_lists[listname]) {
        this.phrase_lists[listname] = []
      }
      // save list
      this.phrase_lists[listname] = [...this.phrase_lists[listname], ...list]
      lists_added++
    }
  }
  /*
   * MarkovStrings, try backwards, if forward was not very successful
   * (only use the first successful list!)
   */
  if (lists_added <= 1) {
    let reversed_keys = [...chunks_keys].reverse()
    let pairs = [
      ["adj", "nou"],
      ["int", "nou"],
      ["int", "int"],
      ["int", "pre"],
      ["int", "pro"],
      ["pro", "ver"],
      ["pre", "ver"],
      ["pro", "adv"],
      ["etc", "nou"],
      ["adv", "ver"],
      ["ver", "adv"],
      ["ver", "nou"],
      ["nou", "nou"]
    ]
    for (let pair of pairs) {
      // backward only as last resort, if no other lists
      // if (lists_added>=1 && (pair[0]==='ver' ||pair[0]==='nou')) {
      //   break
      // }
      // what to call this list
      let listname = `${pair[0]}`
      // make list
      let list = from_simple_mstring.call(this, pair[0], pair[1], reversed_keys)
      if (list && list.length) {
        // make list
        if (!this.phrase_lists[listname]) {
          this.phrase_lists[listname] = []
        }
        // save list
        this.phrase_lists[listname] = [...this.phrase_lists[listname], ...list]
        lists_added++
        // found a good list. stop
        if (list.length >= 15) {
          break
        }
      }
    }
  }
}
