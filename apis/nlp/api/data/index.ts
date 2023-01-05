import domain_extensions from "./domain_extensions"
import domain_syns_of_syns from "./domain_syns_of_syns"
import domain from "./domain"
import domains from "./domains"
import word_add_poswords from "./word_add_poswords"
import word_add_to_others from "./word_add_to_others"
import word_proper_of_synonym from "./word_proper_of_synonyms"
import word_remove_words from "./word_remove_words"
import word_sentiment_of_synonym from "./word_sentiment_of_synonyms"
import word from "./word"

export default [
  ...domain_extensions,
  ...domain_syns_of_syns,
  ...domain,
  ...domains,
  ...word_add_poswords,
  ...word_add_to_others,
  ...word_proper_of_synonym,
  ...word_remove_words,
  ...word_sentiment_of_synonym,
  ...word
]
