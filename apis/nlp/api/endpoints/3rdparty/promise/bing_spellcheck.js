import axios from "axios";
let bing_api_url = "https://api.bing.microsoft.com/v7.0/spellcheck";
// https://eastus.api.cognitive.microsoft.com/bing/v7.0/spellcheck
import { performance } from "perf_hooks";
/**
 * Spell-check, auto-correct
 */
let DEBUG1 = false;
let DEBUG2 = false;
export default function (string, options = {}) {
    return new Promise(function (resolve) {
        /*
         * don't spend too long on one request
         */
        let axiosSource = axios.CancelToken.source();
        let timeout = setTimeout(() => {
            global.cconsole.warn("TIMEOUT SPELLCHECK");
            axiosSource.cancel("TIMEOUT SPELLCHECK");
            resolve(false);
        }, 3000
        // global["DEVELOPMENT"] ? 1500 : (string.length>10 ? 750 : 500)
        );
        /*
         * debug time
         */
        let time_start = performance.now();
        let time_debug = function () {
            if (options.DEBUG_TIME) {
                global.cconsole.info("DEBUG_TIME SPELLCHECK", ((performance.now() - time_start) / 1000).toFixed(2));
            }
        };
        /*
         * request
         */
        setImmediate(function () {
            // start
            if (DEBUG1)
                global.cconsole.info(`spellcheck input "${string}"`);
            let string_spellchecked = string;
            try {
                // request data
                let url = bing_api_url;
                let data = {
                    text: string + ".",
                    mode: "spell",
                    mkt: "en-us"
                };
                let headers = {
                    "Ocp-Apim-Subscription-Key": "fea67c4a3751420386a4ae337b8ba8b7",
                    "Ocp-Apim-Subscription-Region": "global"
                };
                // send request
                if (DEBUG2)
                    global.cconsole.log("send response", data);
                axios
                    .get(url, {
                    params: data,
                    headers: headers,
                    cancelToken: axiosSource.token
                })
                    .then(function (response) {
                    if (DEBUG2)
                        global.cconsole.log("got response", response.data);
                    // response data
                    if (response.data.flaggedTokens[0]) {
                        let best_score = 0; // array of arrays of words
                        let suggestions = response.data.flaggedTokens[0].suggestions;
                        if (DEBUG1)
                            global.cconsole.log("bing suggestions", suggestions);
                        // read each spellcheck suggestion
                        for (let item of suggestions) {
                            if (item.suggestion) {
                                // fix score
                                if (item.suggestion.includes(" ")) {
                                    item.score += 1;
                                }
                                // keep one which has the most words
                                if (item.score > best_score) {
                                    string_spellchecked = item.suggestion.toLowerCase();
                                    best_score = item.score;
                                }
                            }
                        }
                    }
                    // debug
                    if (DEBUG1) {
                        if (string_spellchecked && string_spellchecked !== string) {
                            global.cconsole.log(`bing spellcheck string_spellchecked "${string}" -> "${string_spellchecked}"`);
                        }
                        else {
                            if (DEBUG1)
                                global.cconsole.info(`bing spellcheck did not fix "${string}"`);
                        }
                    }
                    // fix string
                    if (string_spellchecked &&
                        string_spellchecked.length >= 4 &&
                        string.length - string_spellchecked.length < 3) {
                        // flag for later
                        options.spellcheck_applied = true;
                        if (DEBUG1)
                            global.cconsole.log("\nspellchecked alternative = " + string_spellchecked + "\n");
                        /*
                         * make sure to have the full input string, but now spellchecked
                         */
                        if (string_spellchecked.length < string.length - 1) {
                            // fix spellchecked string
                            // often, Microsoft spellcheck removes a word which it does not know about
                            let str_before = "";
                            let str_after = "";
                            let found_key = string_spellchecked.split(" ")[0];
                            if (found_key) {
                                let cut_start = string.indexOf(found_key);
                                if (cut_start !== -1) {
                                    let cut_end = cut_start + string.length;
                                    // found missing chunk before
                                    if (cut_start > 0) {
                                        str_before = string.substring(0, cut_start);
                                    }
                                    // found missing chunk after
                                    if (cut_end < string.length) {
                                        str_after = string.substring(cut_start, string.length);
                                    }
                                }
                            }
                            // even if not found in DB,
                            // overwrite string, so subsequent scripts (middle/highest resolutions) use it
                            string_spellchecked = (str_before + string_spellchecked + str_after).trim().toLowerCase();
                        }
                    }
                    if (string_spellchecked !== string) {
                        string_spellchecked = string_spellchecked.replace(/[\s]+/g, " ").replace(/[^\w\d ]+/g, "");
                    }
                    // debug time
                    time_debug();
                    // done
                    clearTimeout(timeout);
                    resolve(string_spellchecked || string);
                })
                    .catch(function (error) {
                    if (DEBUG1)
                        global.cconsole.warn(`bing spellcheck failed`, error);
                    clearTimeout(timeout);
                    resolve(string);
                });
            }
            catch (err) {
                if (DEBUG1)
                    global.cconsole.error(`bing spellcheck error on "${string}"`, err);
            }
        });
    });
}
