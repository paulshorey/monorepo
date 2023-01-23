import root from "./root"
import deploy from "./deploy"
import not_found from "./not_found"
import { endpointHandler } from "@ps/nlp/lib/http"
import { Express } from "express-serve-static-core"

// This needs to come very last, after all other endpoints
// because not_found is a wildcard catch-all
const api_endpoints = [...root, ...deploy, ...not_found]

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
