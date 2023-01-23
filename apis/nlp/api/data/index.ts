import domain_syns_of_syns from "./domain_syns_of_syns"
import domain from "./domain"
import domains from "./domains"
import word_add_poswords from "./word_add_poswords"
import word_add_to_others from "./word_add_to_others"
import word_proper_of_synonym from "./word_proper_of_synonym"
import word_remove_words from "./word_remove_words"
import word_sentiment_of_synonym from "./word_sentiment_of_synonym"
import word from "./word"
import { endpointHandler } from "@ps/nlp/lib/http"
import { Express } from "express-serve-static-core"

const api_endpoints = [
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

export default function (expressApp: Express) {
  // Handle each API endpoint with expressApp
  for (let endpoint of api_endpoints) {
    const { path, method, authFunctions = [], response }: any = endpoint
    endpointHandler({
      expressApp,
      path,
      method,
      authFunctions,
      response
    })
  }
}
