// import { object_from_querystring, querystring_from_object } from "@techytools/fn/io/urls"

/*
  1) CONFIG - DEFAULT STATE:
*/
const initialState = {
  get_domains: false,
  words_arr: [],
  first_word: "",
  spellchecked: "",
  str: "",
  tld: "",
  captcha2: "",
  captcha3: "",
  // these will be sent to API, with http request
  suggestions_options: {
    use_phrase_hacks: true,
    use_word_hacks: true,
    use_synonyms: true,
    use_dashes: true,
    return_word_rows: true, // this is so the server returns the POSS dictionary of rows
  },
  in_progress: false,
  params_stringified: "",
  search_now: 0,
  auth_expires: 10000000000000,
};

/*
  2) REDUCE STATE:
*/
const ThisReducer = (state = initialState, action) => {
  let newState = { ...state };

  /*
    3) HANDLE ACTIONS:
  */
  switch (action.type) {
    /*
     * show unavailable results
     */
    case "RX__set_suggestions_option":
      newState.suggestions_options[action.key] = action.value;
      break;
    case "RX__toggle_suggestions_option":
      newState.suggestions_options[action.key] = action.force !== null ? action.force : !newState.suggestions_options[action.key];
      break;

    /*
     * trigger search when user interacts with the Search.js component
     */
    case "RX__search_now":
      newState.search_now++;
      break;

    /*
     * inputs must all be set at the same time, to avoid multiple re-renders:
     */
    case "RX__set_inputs":
      {
        /*
         * set each input
         */
        for (let key in action.data) {
          if (key === "str") {
            action.data["str"] = action.data["str"]
              .replace(/[^\w\d\-]+/g, "")
              .toLowerCase()
              .trim();
          }
          newState["" + key] = action.data[key] || initialState["" + key];
        }
        newState["words_arr"] = [...new Set((newState["str"] + " " + newState["tld"] + " " + newState["spellchecked"]).split(" "))];
      }
      break;

    case "RX__clear_inputs":
      {
        // reset state
        newState.tld = initialState.tld;
        newState.str = initialState.str;
        newState.captcha2 = initialState.captcha2;
        newState.captcha3 = initialState.captcha3;
        newState.spellchecked = initialState.spellchecked;
        newState.first_word = initialState.first_word;
        newState.words_arr = initialState.words_arr;
      }
      break;

    case "RX__set_suggestions_options":
      if (action.data) {
        for (let key in action.data) {
          newState.suggestions_options[key] = action.data[key];
        }
      } else {
        newState.suggestions_options = initialState.suggestions_options;
      }
      break;

    case "RX__in_progress":
      newState.in_progress = !!action.data;
      break;

    case "RX__reset":
      newState = { ...initialState };
      break;

    case "RX__params_stringified":
      newState.params_stringified = action.data;
      break;

    case "RX__auth_expires":
      newState.auth_expires = action.data;
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
