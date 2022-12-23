import sort_strings_by_length from "@techytools/fn/io/sort_strings/sort_strings_by_length"
import { performance } from "perf_hooks"
import axios from "axios"
let base_url = "http://google.com/complete/search?output=toolbar&client=chrome&q="
/**
 * Spell-check, auto-correct
 */
let DEBUG1 = false
export default function (string, options = {}) {
  return new Promise(function (resolve) {
    /*
     * don't spend too long on one request
     */
    let axiosSource = axios.CancelToken.source()
    let timeout = setTimeout(
      () => {
        global.cconsole.warn("TIMEOUT GAUTOCOMPLETE")
        axiosSource.cancel("TIMEOUT GAUTOCOMPLETE")
        resolve(false)
      },
      global["DEVELOPMENT"] ? 1500 : string.length > 10 ? 750 : 500
    )
    /*
     * debug time
     */
    let time_start = performance.now()
    let time_debug = function () {
      if (options.DEBUG_TIME) {
        global.cconsole.info("DEBUG_TIME GAUTOCOMPLETE", ((performance.now() - time_start) / 1000).toFixed(2))
      }
    }
    /*
     * request
     */
    setImmediate(function () {
      // start
      if (DEBUG1) global.cconsole.info(`GAutocomplete input "${string}"`)
      let output = {
        source: "google"
      }
      let suggestions = []
      try {
        // request data
        let url = base_url + string
        // send request
        axios
          .get(url, {
            cancelToken: axiosSource.token
          })
          .then(function (response) {
            // parse response
            if (response.data && response.data[1] && response.data[1] instanceof Array) {
              for (let str of response.data[1]) {
                suggestions.push(str)
              }
              if (DEBUG1) global.cconsole.log("GAutocomplete all", suggestions)
              sort_strings_by_length(suggestions)
            }
            // ignore
            suggestions = suggestions.map((str) => {
              let snd_space = str.indexOf(" ", suggestions[0].length + 1)
              if (snd_space !== -1) {
                str = str.substring(0, snd_space)
              }
              return str
            })
            suggestions = suggestions.filter((str) => {
              if (/[^\w\d\s]+/.test(str)) {
                return false
              }
              // last word
              let last_word_i = str.lastIndexOf(" ")
              if (last_word_i === -1) return str
              let last_word = str.substr(last_word_i + 1).trim()
              // filter out not helpful words
              if (
                { asl: 1, net: 1, age: 1, baby: 1, meme: 1, wife: 1, talk: 1, pic: 1, free: 1, crossword: 1 }[last_word]
              ) {
                return false
              }
              if (["syn", "def", "imi", "gif"].includes(last_word.substring(0, 3))) {
                return false
              }
              if (["mean"].includes(last_word.substring(0, 4))) {
                return false
              }
              if (["login", "anime", "comma", "house"].includes(last_word.substring(0, 5))) {
                return false
              }
              if (["lyrics"].includes(last_word.substring(0, 6))) {
                return false
              }
              // idk
              let lastSpace = str.lastIndexOf(" ")
              if (lastSpace > str.length - 3) {
                return false
              }
              return true
            })
            if (DEBUG1) global.cconsole.log("GAutocomplete filtered", suggestions)
            // shortest word is spellchecked key
            let astr = suggestions[0]
            output.key = astr
            output.alts = suggestions
            // done
            time_debug()
            clearTimeout(timeout)
            resolve(output)
          })
          .catch(function (error) {
            clearTimeout(timeout)
            resolve(string)
          })
      } catch (err) {
        if (DEBUG1) global.cconsole.error(`GAutocomplete error on "${string}"`, err)
      }
    })
  })
}
