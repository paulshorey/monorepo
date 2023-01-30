import sourceCodeText from "@techytools/fn/requests/crawl_source/text"
import { basicJSONResponse, basicJSONErrorResponse } from "../../response/basic"

export default async function (request) {
  const searchParams = new URL(request.url).searchParams

  let url = searchParams.get("url")
  if (url && !url.match(/^[a-zA-Z]+:\/\//)) url = "http://" + url

  const selector = searchParams.get("selector")
  const spaced = searchParams.get("spaced") // Adds spaces between tags
  const pretty = searchParams.get("pretty")

  try {
    const data = await sourceCodeText({ url, selector, spaced, pretty })
    return basicJSONResponse(data)
  } catch (error) {
    return basicJSONErrorResponse(error)
  }
}
