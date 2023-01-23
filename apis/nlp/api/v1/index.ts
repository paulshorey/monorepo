import crawl from "./crawl"
import domain_availability from "./domains/availability"
import domain_extensions from "./domain/extensions"
import domain_suggestions from "./domain/suggestions"
import domain_whois from "./domain/whois"
import word from "./word"
import string from "./string"
import { endpointHandler } from "@ps/nlp/lib/http"
import { Express } from "express-serve-static-core"

const api_endpoints = [
  ...crawl,
  ...domain_availability,
  ...domain_extensions,
  ...domain_suggestions,
  ...domain_whois,
  ...word,
  ...string
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
