import { message } from "antd";

/*
  1) CONFIG - DEFAULT STATE:
*/
const defaultState = {
  loading: false,

  meta_title: "",
  search_title: "initial title...",

  // incrementing focusSelectTld will open the domain extensions dropdown
  // will watch for change in componentDidUpdate. So, only need to increment, not manage true/false state
  focusSelectTld: 0,

  show_premium_registry: true,
  show_premium_aftermarket: true,
  show_premium_unknown: true,
  show_unavailable: true,
  show_word_hacks: true,
  show_phrase_hacks: true,
  show_com_hacks: true,
  show_one_list: true,

  show_wip: false,
  show_poss: false,
  show_more_options: false,
};

/*
  2) REDUCE STATE:
*/
const ThisReducer = (state = defaultState, action) => {
  const newState = { ...state };

  /*
    3) HANDLE ACTIONS:
  */
  switch (action.type) {
    /*
     * set a specific value
     */
    case "ui":
      newState[action.key] = action.value;
      break;

    /*
     * mix all results into one list
     */
    case "RX__toggle_key":
      newState[action.key] = action.force !== null ? action.force : !newState[action.key];
      break;

    /*
     * etc
     */
    case "RX__focusSelectTld":
      // will watch for change in componentDidUpdate. So, only need to increment, not manage true/false state
      newState.focusSelectTld++;
      break;

    case "RX__meta_title":
      newState.meta_title = action.data;
      break;

    case "RX__search_title":
      newState.search_title = action.data;
      break;

    case "RX__toast":
      // this is a non-standard hack - needs refactor:
      // but it does work very well as is!!! :D
      message[action.intent || "success"](action.message);
      break;

    default:
      break;
  }

  /*
    4) RETURN (COPY OF) STATE:
  */
  return newState;
};

export default ThisReducer;
