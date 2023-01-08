import { message } from "antd"
import axios from "axios"

const DEVELOPMENT = process.env.NODE_ENV === "development"
let token = "asdffdfdf"
let putUrl = "https://manage-your-account.p.rapidapi.com/v1/contact"
if (DEVELOPMENT) {
  putUrl = "http://localhost:1080/v1/contact"
}
let putHeaders = {
  "content-type": "application/json",
  "x-rapidapi-host": "manage-your-account.p.rapidapi.com",
  "x-rapidapi-key": "9407dfdda9msh488197632304125p1b200bjsnff4a5b2f6272",
  "useQueryString": true
}
if (DEVELOPMENT) {
  putHeaders = {"content-type": "application/json",}
}

let putContactData = function (contactData, captcha_response = "any_string") {
  return new Promise(function (resolve) {
    // request
    axios({
      method: "put",
      url: putUrl,
      headers: putHeaders,
      data: {
        contact: contactData,
        captcha_response: captcha_response
      }
    })
      .then((results) => {
        // parse data from response
        // output data, NOT object with property "data"
        if (results.data && "data" in results.data) {
          resolve(results.data.data)
        } else {
          console.warn('server response did not have "data" key')
          resolve(results.data)
        }
      })
      .catch((error) => {
        // parse error text from response
        // output object with property "error"
        let data = error.response.data || error.data || { error_message: "" }
        data.error_message = data.error_message || error.error_message || error
        console.log("axios error", data)
        resolve(data)
      })
  })
}

/*
 * Submit contact form
 */
export function RX__contact(contactData) {
  return (dispatch) => {
    if (!"updates_product" in contactData) {
      contactData.updates_product = true
    }
    if (!contactData.email) {
      message.error(`Please enter your email address.`, 10)
      return
    }
    // grecaptcha.ready(function () {
    //   grecaptcha.execute("6LfSN-MUAAAAAOxMUojSlBxkicjSeX1YLW8ds8C1", { action: "submit" }).then(function (token) {
    console.log("captcha_response", token)
    if (typeof window === "object" && window.isLoading) window.isLoading("contact")
    putContactData(contactData, token).then(function (data) {
      if (typeof window === "object" && window.doneLoading) window.doneLoading("contact")
      if (data.error_message) {
        message.error(data.error_message || "Could not send. Something went wrong.", 10)
      } else if (contactData.text) {
        message.success("Message sent. Thank you. We'll get back to you soon.", 10)
      } else {
        message.success("Email saved. Thanks. We promise not to spam you!", 10)
      }
    })
    //   })
    // })
  }
}
