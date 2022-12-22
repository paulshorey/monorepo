// import original_replace_original from "@ps/nlp/api/endpoints/domain_suggestions/suggestions/this.phrase_lists/word_dict/original_replace_one"
// import original_one_word from "@ps/nlp/api/endpoints/domain_suggestions/suggestions/this.phrase_lists/word_dict/original_one_word"
// import self_before_after from "./phrase_list/self_before_after"
import sort_strings_by_length from "@ps/fn/io/sort_strings/sort_strings_by_length"
import matrix_flatten_to_strings from "@ps/fn/io/strings/matrix_horizontal_string_combinations"

/**
 * Replace each word in a phrase, X times
 *        X = 2/3 of the number of 1st POS synonyms of that word
 *        `Math.floor(row.poss[row.pos1].length * 0.67)`
 * @returns {array} array - array of arrays (each child array value is a word)
 */
let DEBUG1 = false
export default function () {
  let { keys_words, chunks_dict } = this

  /*
   *
   * original string starts with TLD
   *
   */
  for (let tld of this.tlds) {
    if (this.string.substring(0, tld.length) === tld) {
      this.phrase_lists["original"].push([this.string.substr(tld.length).trim()])
    }
    if (this.string !== this.string_original && this.string_original.substring(0, tld.length) === tld) {
      this.phrase_lists["original"].push([this.string_original.substr(tld.length).trim()])
    }
  }

  /*
   *
   * exact phrase,
   * also variants of phrase with alterante words (abbreviations, roots, acronyms)
   *
   */
  // each column = array of key derivations, first item being the original key
  if (DEBUG1) global.cconsole.warn("key_words", keys_words)

  let matrix = [...keys_words].map((key) => [key])

  // add derivations to columns in matrix
  matrix.forEach((column, ci) => {
    let key = column[0]
    let row = chunks_dict[key]
    // temporary dictionary of derivations: { lowercase: original, }
    let derivations: any = {}
    derivations[row.key] = row.key
    if (row.root) derivations[row.root.toLowerCase()] = row.root.toLowerCase()
    if (row.singular) derivations[row.singular.toLowerCase()] = row.singular.toLowerCase()
    if (row.abbreviation) {
      let abbrs = row.abbreviation.split(",")
      for (let abbr of abbrs) {
        if (!abbr) continue
        derivations[abbr.toLowerCase()] = abbr.toLowerCase()
      }
    }
    if (row.acronym) derivations[row.acronym.toLowerCase()] = row.acronym.toLowerCase()
    // only allow plural for last word in phrase
    if (ci === matrix.length - 1) {
      if (row.plural) derivations[row.plural.toLowerCase()] = row.plural.toLowerCase()
    }
    // persist dictionary values to list (column)
    // column is already filled with one item (key), so, trusting that new items !== key
    for (let lower in derivations) {
      let word = derivations[lower].toLowerCase().trim()
      if (word) {
        column.push(word)
      }
    }
  })

  // make new phrases from derivations (and from original keys)
  let phrases_list = matrix_flatten_to_strings(matrix) // <<<--- flatten to array, using @twodashes/universal library
  phrases_list = sort_strings_by_length(phrases_list)
  for (let phrase of phrases_list) {
    if (phrase.length < 4) continue
    let arr = phrase.split(" ")
    this.phrase_lists["original"].push(arr)
  }

  /*
   *
   * make acronym
   *
   */
  if (keys_words.length > 1) {
    let acronym = []
    for (let key of keys_words) {
      let row = chunks_dict[key]
      if (key.length > 3 || !row.aux) {
        // add one letter to create acronym
        acronym.push(key[0])
      }
    }
    if (acronym.length > 3) {
      this.phrase_lists["original"].push(acronym)
    }
  }

  /*
   *
   * append tld to phrase
   *
   */
  // if (this.tld.length >= 4) {
  //   this.phrase_lists["original"].push([...keys_words, this.tld])
  // }
  // if (this.tld !== "com") {
  //   let row = this.chunks_dict[this.tld]
  //   if (row) {
  //     let list = row.poss[row.pos1] || []
  //     if (list[0]) {
  //       this.phrase_lists["original"].push([...keys_words, list[0]])
  //     }
  //     // if (list[1]) {
  //     //   this.phrase_lists["original"].push([...keys_words, list[1]])
  //     // }
  //     // if (list[2]) {
  //     //   this.phrase_lists["original"].push([...keys_words, list[2]])
  //     // }
  //     // if (list[3]) {
  //     //   this.phrase_lists["original"].push([...keys_words, list[3]])
  //     // }
  //     // if (list[4]) {
  //     //   this.phrase_lists["original"].push([...keys_words, list[4]])
  //     // }
  //   }
  // }

  /*
   *
   * each exact word in original phrase
   *
   */
  let ki = 0
  let words = [...new Set([...this.best_keys, ...keys_words])]
  for (let key of words) {
    if (key.length <= 2) continue
    // add root
    let row = this.chunks_dict[key]
    if (row && row.list_count && row.root) {
      this.phrase_lists["original"].push([row.root])
    }
    // add original phrase
    if (ki === 0) {
      this.phrase_lists["original"].push([key])
      // first 2, last 2
      let words = key.split(" ")
      if (words[2]) {
        this.phrase_lists["original"].push([words[0], words[1]])
        let last_i = words.length - 1
        this.phrase_lists["original"].push([words[last_i - 1], words[last_i]])
      }
    }
    // add each word
    else {
      this.phrase_lists["original"].push([key])
    }
    ki++
  }

  /*
   *
   * original string ends with TLD
   *
   */
  // for (let tld of this.tlds) {
  //   if (this.string.substr(-tld.length) === tld) {
  //     this.phrase_lists["original"].push([this.string.substring(0, this.string.length-tld.length).trim()])
  //   }
  //   if (this.string_original !== this.string && this.string_original.substr(-tld.length) === tld) {
  //     this.phrase_lists["original"].push([this.string_original.substring(0, this.string_original.length-tld.length).trim()])
  //   }
  // }
}
