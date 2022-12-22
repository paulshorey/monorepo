import axios from "axios"
import * as querystring from "querystring"
/*
 * DEBUG
 */
const DEBUG1 = false

/*
 * If pass captcha, add IP to dictionary, give value of expiration time
 */
const ip_expirations = {}
const do_authenticate_ip = function (ip, captcha_version) {
  if (captcha_version === 2) {
    // ReCaptcha V2 is more secure -
    // keep authenticated for a while
    ip_expirations[ip] = Date.now() + 3600000 // expires in 60 minutes
    return ip_expirations[ip] - 3200000 // give expiration few minutes earlier
  } else {
    // ReCaptcha V3 is not as secure -
    // give only enough time to finish current user action
    ip_expirations[ip] = Date.now() + 60000 // expires in 60 seconds
    return ip_expirations[ip] - 15000 // give expiration time a bit earlier
  }
}
const is_auth_ip_current = function (ip) {
  let expires = ip_expirations[ip]
  if (!expires || expires < Date.now()) {
    if (DEBUG1) global.cconsole.info("is_auth_ip_current() !expires || expires < Date.now()")
    return false
  }
  if (DEBUG1) global.cconsole.log("is_auth_ip_current OK")
  return true
}

/*
 * Captcha key
 */
const CAPTCHA_SECRET_V2 = "6LeQt-MUAAAAAIDXJwNF1QhyzHkeNdDiLT0y1Jhq"
const CAPTCHA_SECRET_V3 = "6Lf9YmEeAAAAABMVLy-FiLOZ_6WhDX2TZ62vJXJx"

/**
 * Helper function: check captcha verification
 // * @param req {object} - req param from Node Express API block
 * @returns {object} - error message
 */
export default async function (req, { allow_trusted_bypass = true, BYPASS_AUTH = false }: any = {}): Promise<string> {
  return ""
  // let user: any = {}

  // /*
  //  *
  //  * AUTHENTICATE IP ADDRESS - if not already trusted, verify captcha response token
  //  *
  //  */
  // if (!user.expires) {
  //   if (BYPASS_AUTH || (allow_trusted_bypass && is_auth_ip_current(req.client_ip))) {
  //     /*
  //      *
  //      * ALREADY VERIFIED ✅
  //      * because recently passed captcha verification
  //      *
  //      */
  //     if (DEBUG1) global.cconsole.info("trusted req.client_ip", req.client_ip)
  //   } else {
  //     /*
  //      *
  //      * MUST VERIFY CAPTCHA RESPONSE 🔒
  //      * because client ip is unrecognized or expired
  //      *
  //      */
  //     if (DEBUG1) global.cconsole.info("NOT trusted client ip, validate captcha2", req.client_ip)
  //     /*
  //      * captcha2 or captcha3 is required at this point
  //      */
  //     let input_recaptcha2_token =
  //       (req.body && req.body.recaptcha2_token) ||
  //       (req.query.recaptcha2_token ? decodeURIComponent(req.query.recaptcha2_token) : "") ||
  //       ""
  //     let input_recaptcha3_token =
  //       (req.body && req.body.recaptcha3_token) ||
  //       (req.query.recaptcha3_token ? decodeURIComponent(req.query.recaptcha3_token) : "") ||
  //       ""
  //     if (!input_recaptcha2_token && !input_recaptcha3_token) {
  //       return new Error("captcha2 or captcha3 is required")
  //     } else {
  //       /*
  //        * v2/v3? use either one, but prefer v2
  //        */
  //       const input_captcha_version = input_recaptcha2_token ? 2 : 3
  //       const captcha_auth = await axios({
  //         method: "post",
  //         url: "https://www.google.com/recaptcha/api/siteverify",
  //         data: querystring.stringify({
  //           secret: input_captcha_version === 2 ? CAPTCHA_SECRET_V2 : CAPTCHA_SECRET_V3,
  //           response: input_captcha_version === 2 ? input_recaptcha2_token : input_recaptcha3_token,
  //           remoteip: req.client_ip
  //         }),
  //         headers: {
  //           "Content-Type": "application/x-www-form-urlencoded"
  //         }
  //       })

  //       console.log("\n\nTESTING CAPTCHA \ncaptcha_auth.data=", captcha_auth.data, "\n\n")

  //       if (captcha_auth.data.success) {
  //         /*
  //          * captcha success
  //          */
  //         if (DEBUG1) global.cconsole.log("captcha_auth.data.success", req.client_ip)
  //         user.expires = do_authenticate_ip(req.client_ip, input_captcha_version)
  //       } else {
  //         /*
  //          * captcha failed
  //          */
  //         if (DEBUG1) global.cconsole.log("!(captcha_auth.data.success)", req.client_ip)
  //         throw new Error("Captcha verification failed. Please refresh the page or try again.")
  //       }
  //     }
  //   }
  // }

  // /*
  //  * Return date when auth will expire (here on this server):
  //  */
  // return user
}
