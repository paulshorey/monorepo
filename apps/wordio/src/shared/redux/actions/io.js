import all_tlds from "src/shared/data/domains/all";
import { v1_get, v1_domain_suggestions, v1_sedo, v1_whois, v1_afternic } from "src/shared/http/v1";
import * as ui_actions from "src/shared/redux/actions/ui";
import generic_tlds from "src/shared/data/domains/mixins/generic";
import { RX__domain_availability } from "./availability";
import Router from "next/router";
import store from "../store";
import cconsole from "@techytools/cc";

/*
 *
 * INPUTS
 *
 */
const handleRouteChange = (url) => {
  if (url === "/") {
    store.dispatch(RX__clear_inputs());
  }
};
Router.events.on("routeChangeStart", handleRouteChange);

/*
 * ADD TLD (or remove tld, by "adding" it to "unchecked" list)
 * This is called on RX__chunks API response, also from Tlds.js
 */
export function RX__tld_add(tld = "", list_name = "unchecked") {
  return async (dispatch, getState) => {
    // validate
    let { tlds_all } = getState().output;
    if (!tlds_all[tld]) return;
    // unshift to list_name tlds_user/tlds_checked/tlds_unchecked...
    // but, because action "tlds_checked" means something else,
    // convert to verb: tlds_check/uncheck ("tlds_user" stays unchanged)
    let action = list_name;
    if (action.substr(-2) === "ed") {
      action = action.substring(0, action.length - 2);
    }
    // if (action === "user") {
    //   dispatch(io_actions.RX__set_inputs({ tld: tld }))
    // }
    dispatch({
      type: "RX__tld_" + action,
      data: tld,
    });
  };
}

export function RX__toggle_suggestions_options(key, force) {
  return (dispatch) => {
    dispatch({
      type: "RX__toggle_suggestions_options",
      key: key,
      force: force,
    });
  };
}

export function RX__clear_inputs() {
  return (dispatch) => {
    /*
     * reset all reducer properties starting with "input_"
     */
    dispatch({
      type: "RX__clear_inputs",
      data: "",
    });

    /*
     * side-effect - reset url
     */
    // dispatch(ui_actions.RX__meta_title({}));
    // Router.push("/");
  };
}

// set multiple at once, to prevent multiple UI re-renders
export function RX__set_inputs(inputs = {}) {
  return (dispatch, getState) => {
    /*
     * prepare state
     */
    for (let key in inputs) {
      switch (key) {
        case "str":
          {
            // reset generated values if new string
            inputs.spellchecked = "";
            inputs.first_word = "";
            // filter
            inputs[key] = inputs[key].replace(/[^\w\d.\-_ ]+/g, "");
            // set new first word
            let i_space = inputs.str.indexOf(" ");
            if (i_space !== -1) {
              inputs.first_word = inputs[key].substring(0, i_space);
            } else {
              inputs.first_word = inputs[key];
            }
          }
          break;

        case "spellchecked":
          {
            inputs[key] = inputs[key].replace(/[^\w\d.\-_ ]+/g, "");
          }
          break;
      }
    }
    dispatch({
      type: "RX__set_inputs",
      data: inputs,
    });

    /*
     * side-effect - when setting "tld"
     */
    if (inputs.tld) {
      dispatch({
        type: "RX__tld_user",
        data: inputs.tld,
      });
    }

    /*
     * side-effect - set url
     */
    let { input } = getState();
    let str = inputs.str || input.str;
    let tld = inputs.tld || input.tld;
    dispatch(ui_actions.RX__meta_title({ str, tld }));

    /*
     * trigger search
     */
    // dispatch(RX__search_now())
  };
}

/*
 *
 * SEARCH: trigger
 *
 */
export function RX__search_now() {
  return (dispatch, getState) => {
    let { input } = getState();
    console.log("RX__search_now()", input);
    /*
     * The search action is determined in the page which is currently in view -
     * - but when to execute the action is triggered from Search.js component.
     */
    // dispatch({
    //   type: "RX__search_now",
    // });
    dispatch(RX__search_thesaurus());
  };
}

/*
 *
 * AVAILABILITY: add to queue
 *
 */
let timeout_availability_queue;

export function RX__domain_add_to_availability_queue(domain_str) {
  return (dispatch) => {
    /*
     * debounce this
     */
    clearTimeout(timeout_availability_queue);
    timeout_availability_queue = setTimeout(function () {
      dispatch(RX__domain_availability());
    }, 300);
    /*
     * call this every time
     */
    dispatch({
      type: "RX__domain_add_to_availability_queue",
      data: domain_str,
    });
  };
}

/*
 *
 * SEARCH: thesaurus
 *
 */
export function RX__search_thesaurus() {
  return async (dispatch, getState) => {
    /*
     * arguments
     */
    let { input, ui } = getState();
    // cconsole.log("RX__search_thesaurus()", input);
    if (!input.str) {
      // cconsole.log("ignore search_thesaurus() because !input.str");
      return;
    }

    /*
     * set url
     */
    Router.push("/thesaurus?str=" + encodeURIComponent(input.str));

    /*
     * prevent simultaneous calls
     */
    cconsole.log("RX__search_thesaurus ui.loading", ui.loading);
    if (ui.loading) {
      cconsole.warn("ignore search_thesaurus() because ui.loading");
      return;
    }
    dispatch({
      type: "ui",
      key: "loading",
      value: true,
    });
    cconsole.warn("set ui.loading");
    setTimeout(function () {
      dispatch({
        type: "ui",
        key: "loading",
        value: false,
      });
    }, 1000);

    /*
     * send request
     */
    let params = {
      str: input.str,
      recaptcha2_token: input.captcha2,
      recaptcha3_token: input.captcha3,
    };
    let row;
    try {
      cconsole.info("try to get row");
      row = await v1_get("/v1/word", params);
      cconsole.info("AFTER to get row");
      cconsole.success("row", ui.loading, row);
    } catch (e) {
      cconsole.error("COULD NOT GET row", ui.loading, row);
    }
    dispatch({
      type: "ui",
      key: "loading",
      value: false,
    });
    /*
     * got response
     */
    dispatch({
      type: "RX__add_chunk",
      data: row || {},
    });
  };
}

/*
 *
 * PremiumDoms
 *
 */
export function RX__sedo_action(str, tld) {
  return (dispatch) => {
    // reset old results
    dispatch({
      type: "RX__domains_sedo",
      data: {},
    });
    // get new data
    if (!str) return;
    v1_sedo({ domain: `${str}.${tld || "com"}` })
      .then((results) => {
        let coms = [];
        let alts = [];
        /*
         * Aggregate and sort
         */
        if (results.length) {
          for (let dom of results) {
            if (!dom.tld || !dom.price || dom.price > 3000) continue;
            if (dom.tld === "com") {
              coms.push(dom);
            } else {
              alts.push(dom);
            }
          }
          // coms = sort_objects_by_property_and_position(coms.length ? coms : [], "price", 0.5).reverse();
          // alts = sort_objects_by_property_and_position(alts.length ? alts : [], "price", 0.5).reverse();
        }

        dispatch({
          type: "RX__domains_sedo",
          data: { coms, alts },
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };
}

/*
 *
 * Afternic
 *
 */
export function RX__afternic_action(str, tld) {
  return (dispatch) => {
    // reset old results
    dispatch({
      type: "RX__domains_afternic",
      data: {},
    });
    // get new data
    if (!str) return;
    v1_afternic({ domain: `${str}.${tld || "com"}` })
      .then((results) => {
        let coms = [];
        let alts = [];
        /*
         * Aggregate and sort
         */
        if (results.length) {
          for (let dom of results) {
            if (!dom.tld || !dom.price || dom.price > 3000) continue;
            if (dom.tld === "com") {
              coms.push(dom);
            } else {
              alts.push(dom);
            }
          }
          // coms = sort_objects_by_property_and_position(coms.length ? coms : [], "price", 0.5).reverse();
          // alts = sort_objects_by_property_and_position(alts.length ? alts : [], "price", 0.5).reverse();
        }

        dispatch({
          type: "RX__domains_afternic",
          data: { coms, alts },
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };
}

/*
 *
 * SEARCH: suggestions
 *
 */
let ds_in_progress = false;

export function RX__search_suggestions(options = {}) {
  return (dispatch, getState) => {
    if (ds_in_progress) {
      return;
    }
    // let ds_in_progress = performance.now()
    // console.warn(ds_in_progress, " received RX__search_suggestions")

    /*
     * default options (reset Redux state each time)
     */
    if (!("only_available" in options)) {
      options.only_available = true;
    }

    /*
     * save options
     */
    dispatch({
      type: "RX__set_suggestions_options",
      data: options,
    });

    /*
     * arguments
     */
    let { input } = getState();
    if (!input.str) {
      //console.log("ignore search_suggestions() because !input.str")
      return;
    }
    let tld = input.tld || "com";
    let str = input.str;
    let str_nospaces = str.replace(/ /g, "");

    /*
     * set url
     */
    Router.push("/suggestions?str=" + encodeURIComponent(str) + "&tld=" + encodeURIComponent(tld));

    /*
     * data
     */
    let params = {
      ...input.suggestions_options,
      ...options,
      str: str,
      tlds_use: [tld],
      tlds_ignore: [],
    };
    // console.log("RX__search_suggestions()", params)

    /*
     * prevent redundant calls
     */
    let params_stringified = JSON.stringify(params) + Date.now() / 1000; // limit
    if (params_stringified === input.params_stringified) {
      //console.log("ignore search_suggestions() because params_stringified === input.params_stringified")
      return;
    }
    dispatch({
      type: "RX__params_stringified",
      data: params_stringified,
    });

    /*
     * prevent simultaneous calls
     * IMPORTANT: this valudation (return) must be the last validation before the API request,
     * because if "in_progress" flag gets set, but the API does not execute, app will stall.
     */
    if (input.in_progress) {
      //console.log("ignore search_suggestions() because input.in_progress")
      return;
    }
    dispatch({
      type: "RX__in_progress",
      data: true,
    });
    setTimeout(function () {
      dispatch({
        type: "RX__in_progress",
        data: false,
      });
    }, 1000);

    /*
     * clear data: set after get back responses
     */
    dispatch({
      type: "RX__input_spellchecked",
      data: "",
    });

    /*
     * add default domains, and check availability
     */
    let domains_generic = [str + " ." + tld];
    // add .com version if nTLD
    if (tld !== "com") {
      domains_generic.push(str + " " + tld + " .com");
    }
    // add generic
    for (let gtld of generic_tlds) {
      if (gtld !== tld) {
        domains_generic.push(str + " ." + gtld);
      }
    }
    // add tld hack to domains_generic
    // separate string into 2 parts
    for (let i = 2; i < str_nospaces.length - 1; i++) {
      let sld = str_nospaces.substring(0, i).trim();
      let tld = str_nospaces.substr(i).trim();
      if (sld && tld) {
        if (tld.length >= 2 && sld.length >= 3 && all_tlds[tld]) {
          domains_generic.push(sld + " ." + tld);
        }
        if (sld.length >= 4 && tld.length >= 4 && all_tlds[sld]) {
          domains_generic.push(tld + " ." + sld);
        }
      }
    }
    // request
    dispatch({
      type: "RX__domain_suggestions",
      domains_generic: domains_generic,
      results: {
        domains: {},
        wip_domains: [],
        phrases: [],
        word_hacks: [],
        phrase_lists: [],
      },
    });

    /*
     * get PremiumDoms results
     */
    console.log("dispatch action RX__sedo_action");
    dispatch(RX__sedo_action(str, tld));
    console.log("dispatch action RX__afternic_action");
    dispatch(RX__afternic_action(str, tld));

    /*
     * get whois
     */
    console.log("before v1_whois");
    v1_whois({ domain: str_nospaces + "." + tld }).then(async function (data) {
      // end request
      dispatch({
        type: "RX__domains_info",
        domain: str_nospaces + "." + tld,
        data: data,
      });
    });

    /*
     * add captcha token
     * (AFTER comparing params_stringified changes, because captcha param should ALWAYS be different)
     */
    params.recaptcha2_token = input.captcha2;
    params.recaptcha3_token = input.captcha3;

    /*
     * send request
     */
    console.log("before v1_domain_suggestions");
    v1_domain_suggestions(params)
      .then(async function (results = {}) {
        // end request
        dispatch({
          type: "RX__in_progress",
          data: false,
        });

        /*
         * got response
         */
        // tld - always set, even if already specified,
        // because this one is parsed from the query phrase.
        // parsed value overrides value specified by dropdown
        // dispatch(RX__set_inputs({ tld: results.tld }))

        // phrase - spellchecked str
        dispatch({
          type: "RX__set_inputs",
          data: {
            spellchecked: results.string,
          },
        });

        // dictionary of DB rows per word
        dispatch({
          type: "RX__chunks",
          data: results.chunks_rows,
        });

        // the main attraction
        dispatch({
          type: "RX__domain_suggestions",
          results: results,
        });

        // suggested tlds
        dispatch({
          type: "RX__tlds_checked",
          data: results.tlds,
        });

        // suggested tlds which did not fit, because there are too many
        dispatch({
          type: "RX__tlds_extra",
          data: results.tlds_extra,
        });

        // captcha expires time
        dispatch({
          type: "RX__auth_expires",
          data: results.auth_expires,
        });
      })
      .catch(function () {
        // end request
        dispatch({
          type: "RX__in_progress",
          data: false,
        });
      })
      .then(function () {
        // done measuring ds load time,
        // also, now allow next request
        ds_in_progress = 0;
      });
  };
}
