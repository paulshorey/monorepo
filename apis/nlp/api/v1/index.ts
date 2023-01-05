import crawl from "./crawl"
import domain_availability from "./domain_availability"
import domain_extensions from "./domain_extensions"
import domain_suggestions from "./domain_suggestions"
import whois from "./whois"
import word from "./word"
import words from "./words"

// Combine all arrays into one flat list.
// All endpoints are stored as unnamed array items
// so we wont have to deal with naming conventions and conflicts.
export default [
  ...crawl,
  ...domain_availability,
  ...domain_extensions,
  ...domain_suggestions,
  ...whois,
  ...word,
  ...words
]
