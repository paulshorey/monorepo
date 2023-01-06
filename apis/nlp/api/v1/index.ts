import crawl from "./crawl"
import domain_availability from "./domain/availability"
import domain_extensions from "./domain/extensions"
import domain_suggestions from "./domain/suggestions"
import domain_whois from "./domain/whois"
import word from "./word"
import string from "./string"

// Combine all arrays into one flat list.
// All endpoints are stored as unnamed array items
// so we wont have to deal with naming conventions and conflicts.
export default [
  ...crawl,
  ...domain_availability,
  ...domain_extensions,
  ...domain_suggestions,
  ...domain_whois,
  ...word,
  ...string
]
