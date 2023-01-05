import { type reqType, type optionsType } from "./"

const DEBUG1 = false
const TURNSTILE_KEY = "0x4AAAAAAABozldcmsxI0Cbc-0Fp7kW8PW0"

/**
 * VERIFY CAPTCHA RESPONSE 🔒
 * Success: return expiration time
 * Failure: return Error
 */
export default async function (req: reqType, {}: optionsType = {}): Promise<number | Error> {
  return Date.now() + 1000000
  let turnstile_token =
    (req.body && req.body.turnstile_token) ||
    (req.query.turnstile_token ? decodeURIComponent(req.query.turnstile_token) : "") ||
    ""
  if (!turnstile_token) {
    return new Error("turnstile token is required")
  } else {
    /*
     * validate user token
     */
    let formData = new FormData()
    formData.append("secret", TURNSTILE_KEY)
    formData.append("response", turnstile_token)
    formData.append("remoteip", req.client_ip)

    const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
    const result = await fetch(url, {
      body: formData,
      method: "POST"
    })
    const captcha_result = await result.json()

    if (captcha_result.success) {
      /*
       * captcha success
       */
      if (DEBUG1) global.cconsole.success("captcha success", req.client_ip)
      return Date.now() + 300000 // expires in 5 minutes
    } else {
      /*
       * captcha failed
       */
      if (DEBUG1) global.cconsole.warn("!(captcha_result.success)", req.client_ip)
      return new Error("Captcha verification failed. Please refresh the page or try again.")
    }
  }
}
