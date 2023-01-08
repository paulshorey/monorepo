import all_tlds from "src/shared/data/domains/all";
import { obj_is_empty } from "@techytools/fn/io/obj";

function get_ss(key, default_value) {
  if (typeof window !== "object") {
    return default_value;
  }
  // return default_value
  let ss_value = window.sessionStorage.getItem(key);
  // console.log('got from ss:', key, ss_value);
  return ss_value ? JSON.parse(ss_value) : default_value;
}

function set_ss(key, value) {
  if (typeof window === "object") {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  }
}

/*
  1) CONFIG - DEFAULT STATE:
*/
const initialState = {
  chunks: {}, // dictionary of word DB rows: { key: { key: '', poss: {} } }
  com_hacks: [],
  word_hacks: [],
  phrase_hacks: [],
  domains_generic: [],
  domains_info: {},
  domain_suggested: {},
  suggestions_wip_domains: [],
  suggestions_phrases: [],
  suggestions_phrase_lists: [],
  domain_availability_queue: {},
  domain_availability_queue_sent: {},
  domain_availability: {}, //get_ss("domain_availability", {}),
  domain_availability_source: get_ss("domain_availability_source", {}),

  tlds_all: all_tlds,
  tlds_user: get_ss("tlds_user", {}),
  tlds_checked: {}, //get_ss('tlds_checked', {}),
  tlds_unchecked: {},
  tlds_extra: {},

  is_name: false,
  is_brand: false,
  is_tech: false,

  domains_sedo: null,
  domains_afternic: null,

  str_possibly_corrupted: false,
};

/*
  2) REDUCE STATE:
*/
const ThisReducer = (state = initialState, action) => {
  const newState = { ...state };

  /*
    3) HANDLE ACTIONS:
  */
  switch (action.type) {
    /*
     * action
     */
    case "RX__domains_sedo":
      if (action.data) {
        newState["domains_sedo"] = action.data;
      }
      break;
    /*
     * action
     */
    case "RX__domains_afternic":
      if (action.data) {
        newState["domains_afternic"] = action.data;
      }
      break;
    /*
     * action
     */
    case "RX__domains_info":
      if (action.domain && action.data) {
        newState["domains_info"][action.domain] = action.data;
      }
      break;

    /*
     * @action.listType {string}
     */
    case "RX__toggle_suggestions_list":
      if (action.listType && newState.hasOwnProperty("hide_" + action.listType)) {
        newState["hide_" + action.listType] = !newState["hide_" + action.listType];
      }
      break;

    /*
     * action
     */
    case "RX__domain_suggestions":
      action.results = action.results || {};
      let phrase = newState.str;
      let tld = newState.tld;

      /*
       * reduce number of results, for debugging
       */
      // if (action.results.domains) {
      //   for (let listname in action.results.domains) {
      //     action.results.domains[listname] = action.results.domains[listname].slice(0, 50)
      //   }
      // }

      /*
       * add back-end content
       */
      if (action.domains_generic) {
        // first pass - add
        newState.domains_generic = action.domains_generic || [];
      } else if (!action.results.string_possibly_corrupted) {
        // second pass - fix
        if (action.results.string && action.results.string !== action.results.string_original) {
          newState.domains_generic = newState.domains_generic.map((str) => {
            // add spaces between words
            let fixed = str.replace(action.results.string_original, action.results.string);
            if (fixed.replace(/ /g, "") === str) {
              return fixed;
            }
            return str;
          });
        }
      }
      newState.domain_suggested = action.results.domains || {};
      newState.suggestions_phrases = action.results.phrases || [];
      newState.com_hacks = action.results.com_hacks || [];
      newState.word_hacks = action.results.word_hacks || [];
      newState.phrase_hacks = action.results.phrase_hacks || [];
      newState.suggestions_phrase_lists = action.results.phrase_lists || [];
      newState.string_possibly_corrupted = action.results.string_possibly_corrupted;

      /*
       * set meta flags
       */
      newState.is_name = !!action.results.is_name;
      newState.is_brand = !!action.results.is_brand;
      newState.is_tech = !!action.results.is_tech;

      /*
       * use custom Front-End suggestions, if no backend suggestions exist yet
       */
      // if (phrase && tld) {
      //   let fe_original_suggestions = [];
      //   let phrase_clean = phrase.replace(/[^\w\d-_.]+/g, "");
      //   fe_original_suggestions.push(phrase_clean + "." + tld);
      //   let ntldi = 0;
      //   for (let ntld in all_tlds) {
      //     // add few top tlds immediately, without waiting for API
      //     if (tld !== ntld) fe_original_suggestions.push(phrase_clean + "." + ntld);
      //     // next
      //     ntldi++;
      //     if (ntldi > 7) break;
      //   }
      //   // add, if no backend suggestions exist yet
      //   if (!newState.domain_suggested["original"] || !newState.domain_suggested["original"].length) {
      //     newState.domain_suggested["original"] = fe_original_suggestions;
      //   }
      // }
      break;

    /*
     * action
     */
    case "RX__domains_add_to_availability_queue_sent":
      if (action.data && action.data.length) {
        for (let dom of action.data) {
          newState.domain_availability_queue_sent[dom] = true;
        }
      }
      break;

    case "RX__domain_add_to_availability_queue":
      if (action.data) {
        newState.domain_availability_queue[action.data] = true;
      }
      break;

    case "RX__availability_queue_clear":
      newState.domain_availability_queue = {};
      break;

    /*
     * action
     */
    case "RX__domain_availability":
      if (action.data) {
        // reset
        newState.domain_availability = { ...newState.domain_availability };
        // bulk
        for (let key in action.data) {
          newState.domain_availability[key] = action.data[key] || 0;
        }
        // persist
        set_ss("domain_availability", newState.domain_availability);
      }
      break;

    /*
     * action
     */
    case "RX__tlds_checked":
      if (action.data) {
        /*
         * reset - dump all into unchecked
         * clear all old extensions
         */
        newState.tlds_checked = {};
        /*
         * set user/checked/unchecked
         */
        for (let tld of action.data) {
          if (!newState.tlds_user[tld]) {
            newState.tlds_checked[tld] = true;
          }
        }
        /*
         * persist
         */
        set_ss("tlds_checked", newState.tlds_checked);
      }
      break;

    /*
     * action
     */
    case "RX__tlds_extra":
      if (action.data) {
        newState.tlds_extra = action.data;
      }
      break;

    /*
     * action
     */
    case "RX__tld_user":
      if (action.data) {
        // add
        newState.tlds_user = { [action.data]: true }; //{ ...{ [action.data]: true }, ...newState.tlds_user }
        // remove
        delete newState.tlds_checked[action.data];
        delete newState.tlds_unchecked[action.data];
        // persist
        set_ss("tlds_user", newState.tlds_user);
        set_ss("tlds_checked", newState.tlds_checked);
      }
      break;

    /*
     * action
     */
    case "RX__tld_check":
      if (action.data) {
        // remove
        delete newState.tlds_unchecked[action.data];
        // add
        newState.tlds_checked = { ...{ [action.data]: true }, ...newState.tlds_checked };
        // persist
        set_ss("tlds_user", newState.tlds_user);
        set_ss("tlds_checked", newState.tlds_checked);
      }
      break;

    /*
     * action
     */
    case "RX__tld_uncheck":
      if (action.data) {
        // add
        newState.tlds_unchecked = { ...{ [action.data]: true }, ...newState.tlds_unchecked };
        // remove
        delete newState.tlds_user[action.data];
        delete newState.tlds_checked[action.data];
        // make sure not to remove the last tld from lists
        if (obj_is_empty(newState.tlds_user) && obj_is_empty(newState.tlds_checked)) {
          // fix
          // {...tlds_user, ...tlds_checked} must have at least one value
          newState.tlds_checked = { ...{ [action.data]: true }, ...newState.tlds_checked };
          // remove from unchecked
          delete newState.tlds_unchecked[action.data];
        }
        // persist
        set_ss("tlds_user", newState.tlds_user);
        set_ss("tlds_checked", newState.tlds_checked);
      }
      break;

    /*
     * action
     */
    case "RX__chunks":
      if (action.data) {
        newState.chunks = action.data || initialState.chunks;
      }
      break;

    /*
     * action
     */
    case "RX__add_chunk":
      if (action.data) {
        let row = action.data;
        if (row && row.key) {
          newState.chunks = { ...newState.chunks, [row.key]: row };
        }
      }
      break;
  }

  /*
    4) RETURN (COPY OF) STATE:
  */
  // console.log(
  //   [action.type, action],
  //   JSON.parse(JSON.stringify(newState)),
  // )
  return newState;
};

export default ThisReducer;
