import sort_strings_by_length from "@techytools/fn/io/sort_strings/sort_strings_by_length"
import { performance } from "perf_hooks"
import axios from "axios"
let bing_api_url = "https://api.cognitive.microsoft.com/bing/v7.0/Suggestions"

/**
 * Spell-check, auto-correct
 */
let DEBUG1 = false
export default function (string, options: any = {}) {
  return new Promise(function (resolve) {
    /*
     * don't spend too long on one request
     */
    let axiosSource = axios.CancelToken.source()
    let timeout = setTimeout(
      () => {
        global.cconsole.warn("TIMEOUT AUTOSUGGEST")
        axiosSource.cancel("TIMEOUT AUTOSUGGEST")
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
        global.cconsole.info("DEBUG_TIME AUTOSUGGEST", ((performance.now() - time_start) / 1000).toFixed(2))
      }
    }

    /*
     * request
     */
    setImmediate(function () {
      // start
      if (DEBUG1) global.cconsole.info(`autosuggest input "${string}"`)
      let output: any = {
        source: "bing"
      }
      let suggestions = []
      try {
        // request data
        let url = bing_api_url
        let data: any = {
          q: string,
          mkt: "en-us"
        }
        let headers: any = {
          "Ocp-Apim-Subscription-Key": "d4303738da87495f991b38afccf6eea3"
        }

        // send request
        axios
          .get(url, {
            params: data,
            headers: headers,
            cancelToken: axiosSource.token
          })
          .then(function (response) {
            // parse response
            if (
              response.data.suggestionGroups &&
              response.data.suggestionGroups[0] &&
              response.data.suggestionGroups[0].searchSuggestions &&
              response.data.suggestionGroups[0].searchSuggestions.length
            ) {
              for (let obj of response.data.suggestionGroups[0].searchSuggestions) {
                suggestions.push(obj.query)
              }
              if (DEBUG1) global.cconsole.log("all", suggestions)
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
            if (DEBUG1) global.cconsole.log("filtered", suggestions)

            // shortest word is spellchecked key
            let astr = suggestions[0]
            output.key = astr
            output.alts = suggestions

            // validate
            // if (astr !== string && astr.length <= string.length + 4) {
            //   // count how many "phrases" (rather than single words) middle 3 results have
            //   // if 2 out of 3 are phrases, then this must be a good suggestion
            //   let spaces = 0
            //   if (suggestions[2] && suggestions[3] && suggestions[4]) {
            //     if (suggestions[2].includes(" ")) spaces++
            //     if (suggestions[3].includes(" ")) spaces++
            //     if (suggestions[4].includes(" ")) spaces++
            //   }
            //   if (spaces < 2) {
            //     time_debug()
            //     resolve(output)
            //     return
            //   }
            // }

            // // only use last words
            // output.alts = []
            // if (DEBUG1) global.cconsole.log("use bing astr:", astr)
            // if (DEBUG1) global.cconsole.log("use bing suggestions:", suggestions)
            // let astr_no_spaces = astr.replace(/ /g, "")
            // for (let str of suggestions) {
            //   let last_word = str
            //     .replace(astr + " ", "")
            //     .replace(astr_no_spaces + " ", "")
            //     .trim()
            //   if (last_word.length >= 3 && last_word.length < 9) {
            //     if (["syn", "def", "imi", "asl", "gif"].includes(last_word.substring(0, 3))) {
            //       continue
            //     }
            //     if (["mean"].includes(last_word.substring(0, 4))) {
            //       continue
            //     }
            //     if (["login"].includes(last_word.substring(0, 5))) {
            //       continue
            //     }
            //     output.alts.push(last_word)
            //   }
            // }

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
        if (DEBUG1) global.cconsole.error(`bing autosuggest error on "${string}"`, err)
      }
    })
  })
}
