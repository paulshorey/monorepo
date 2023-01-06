import authCaptcha from "@ps/nlp/lib/auth/captcha"

export type userType = {
  /**
   * When auth expires (will have to log-in again)
   */
  expires?: number
  /**
   * User id in database
   */
  id?: string
  /**
   * User's IP address
   */
  ip?: string
  /**
   * Is user authenticated
   */
  authenticated?: boolean
}
export type optionsType = any // fixMe
export type reqType = any // fixMe
export type propsType = {
  req: reqType
  authFunctions: string
}

export const ip_expirations = {}

export const set_user_session_expiration = function (user: userType, expireTime: number): number {
  ip_expirations[user.id || user.ip] = expireTime
  return ip_expirations[user.id || user.ip]
}

export const get_user_session_expiration = function (user: userType): number {
  let expires = ip_expirations[user.id || user.ip]
  return Number(expires) || 0
}

/**
 * Authentication handler. If it returns an error, then the endpoint will fail.
 * @returns {string} error message if user not authenticated, or empty string if authenticated
 */
export default async function ({ req, authFunctions }: propsType): Promise<userType | Error> {
  // Get user
  const user: userType = {}
  if (req.query?.user_id) {
    user.id = req.query.user_id
  } else if (req.body?.user?.id) {
    user.id = req.body.user.id
  }
  user.ip = req.client_ip

  // User session still valid?
  user.expires = 0 // get_user_session_expiration(user)
  user.authenticated = user.expires > Date.now()
  if (user.authenticated) {
    return user
  }

  // No authentication needed
  if (!authFunctions) {
    return user
  }

  // Authenticate new user session
  if (authFunctions?.includes("captcha")) {
    const expiration = await authCaptcha(req)
    set_user_session_expiration(user, expiration)
    user.expires = expiration
    user.authenticated = true
  }

  return user
}
