import pos_conjunctions from "@ps/nlp/api/endpoints/data.words/array/pos_conjunctions"
import pos_determiners from "@ps/nlp/api/endpoints/data.words/array/pos_determiners"
import pos_interjections from "@ps/nlp/api/endpoints/data.words/array/pos_interjections"
import pos_prepositions from "@ps/nlp/api/endpoints/data.words/array/pos_prepositions"
import pos_pronouns from "@ps/nlp/api/endpoints/data.words/array/pos_pronouns"

export const phrase_capitalize = function (phrase) {
  let array = []
  // check each word in phrase
  for (let word of phrase.split(" ")) {
    if (
      !pos_conjunctions.includes(word) &&
      !pos_determiners.includes(word) &&
      !pos_interjections.includes(word) &&
      !pos_prepositions.includes(word) &&
      !pos_pronouns.includes(word)
    ) {
      // free morpheme (real word)
      array.push(word.charAt(0).toUpperCase() + word.slice(1))
    } else {
      // bound morpheme ("and" "his" "the")
      array.push(word)
    }
  }
  return array.join(" ")
}

export const is_free_morpheme = function (word) {
  if (
    !pos_conjunctions.includes(word) &&
    !pos_determiners.includes(word) &&
    !pos_interjections.includes(word) &&
    !pos_prepositions.includes(word) &&
    !pos_pronouns.includes(word)
  ) {
    // free morpheme (real word)
    return true
  } else {
    // bound morpheme ("and" "his" "the")
    return false
  }
}
