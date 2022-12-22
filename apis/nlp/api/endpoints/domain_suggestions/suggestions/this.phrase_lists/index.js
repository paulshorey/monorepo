import add_from_nlp from "@ps/nlp/api/endpoints/domain_suggestions/suggestions/this.phrase_lists/add_from_nlp"
import add_original from "@ps/nlp/api/endpoints/domain_suggestions/suggestions/this.phrase_lists/add_original"
import add_autocomplete from "@ps/nlp/api/endpoints/domain_suggestions/suggestions/this.phrase_lists/add_autocomplete"
import self_before_after from "./phrase_list/self_before_after"
import fws from "@ps/nlp/data/words/fw/fw"
import original_replace_original from "@ps/nlp/api/endpoints/domain_suggestions/suggestions/this.phrase_lists/from_originals/original_replace_one"
import original_one_word from "@ps/nlp/api/endpoints/domain_suggestions/suggestions/this.phrase_lists/from_originals/original_one_word"
export default function make_lists() {
  let { chunks_keys, chunks_dict } = this
  // which words to use
  let use_words = [...chunks_keys].filter((key) => !(key || "").includes(" "))
  if (
    this.tld_chunk &&
    this.tld_chunk.list_count > 5 &&
    ["nou", "adj", "ver", "adv", "int"].includes(this.tld_chunk.pos1)
  ) {
    if (use_words.length === 1) {
      use_words.push(this.tld_chunk.key)
    }
  }
  /*
   *
   * ORIGINAL exact
   *
   */
  add_original.call(this)
  /*
   *
   * Autocomplete
   *
   */
  add_autocomplete.call(this)
  /*
   *
   * suggestions based on ORIGINAL
   *
   */
  original_replace_original.call(this)
  original_one_word.call(this)
  /*
   *
   * PHRASE LISTS - from markov strings
   *
   */
  add_from_nlp.call(this)
  /*
   *
   * PHRASES from before/after
   *
   */
  let before_list = []
  for (let word of this.best_keys) {
    if (!word || fws[word]) {
      continue
    }
    let row = chunks_dict[word]
    let list = self_before_after.call(this, row)
    if (list && list.length) {
      before_list = [...before_list, ...list.slice(0, 2)]
    }
  }
  if (before_list.length) {
    this.phrase_lists["before"] = before_list
  }
}
