import api_3rdparty from "./3rdparty"
import api_domains from "./data.domains"
import api_words from "./data.words"
import api_wordio from "./wordio"
import domain_suggestions from "./domain_suggestions"
import domain_availability from "./domain_availability"
import domain_tools from "./domain_tools"
import api_crawl from "./crawl"
import api_utils from "./utils"

// Combine all arrays into one flat list.
// All endpoints are stored as unnamed array items
// so we wont have to deal with naming conventions and conflicts.
export default [
  ...api_3rdparty,
  ...api_domains,
  ...api_words,
  ...api_wordio,
  ...domain_suggestions,
  ...domain_availability,
  ...domain_tools,
  ...api_crawl,
  ...api_utils
]
