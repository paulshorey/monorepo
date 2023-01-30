import React from "react";
import PropTypes from "prop-types";
import { faCaretDown } from "@fortawesome/pro-solid-svg-icons/faCaretDown";
import { faCaretUp } from "@fortawesome/pro-solid-svg-icons/faCaretUp";
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";
import { DomsStyled } from "./Doms.styled";
import Dom from "./Dom";
// import { H5Styled } from "src/shared/containers/Domains/Domains.styled";
// import { strings_shuffle_last, strings_shuffle_last_strict } from "@techytools/fn/io/strings"
import str_capitalize from "@techytools/fn/io/str/str_capitalize";
// import { strings_shuffle_first_last_strict } from "@techytools/fn/io/strings"
// import sort_strings_by_rating from "@techytools/fn/io/sort_strings/sort_strings_by_rating_and_position"
// import sort_strings_by_rating_and_position from "@techytools/fn/io/sort_strings/sort_strings_by_rating_and_position"

function round_to_precision(num, precision) {
  num = parseFloat(num);
  if (!precision) return num;
  return Math.round(num / precision) * precision;
}

let list_title = function (listname, one_list, only_available) {
  // custom capitalize / edit title
  if (listname === "tld") {
    return "TLD Suggestions";
  } else if (listname === "exact") {
    return "Exact match + Generic TLDs";
  } else if (listname === "word hack") {
    return "Brandable";
  } else if (listname === "name") {
    if (only_available) {
      return "Available names";
    } else {
      if (one_list) {
        return "All suggestions";
      } else {
        return "Name suggestions";
      }
    }
  } else if (listname === "com") {
    if (only_available) {
      return "Available .com";
    } else {
      return ".com suggestions";
    }
  } else if (listname === "generic") {
    if (only_available) {
      return "Available results";
    } else {
      return "Search results";
    }
  } else if (listname === "all") {
    return "Suggestions";
  }
  // capitalize all by default
  return str_capitalize(listname) + "s";
};
let list_limit = function (listname, one_list, list_length) {
  // defaults for each category
  // Note: (one_list ? 6 : 9)
  // First "?" number is how many to show all at once on top
  // Second ":" number is how many to scatter in ever other few
  let limit = 99;
  if (listname === "exact") {
    limit = one_list ? 0 : 6;
  } else if (listname === "com") {
    limit = one_list ? 0 : round_to_precision(list_length / 3, 3);
  } else if (listname === "tld") {
    limit = one_list ? 0 : 6;
  } else if (listname === "word hack") {
    limit = one_list ? 0 : 3;
  } else if (listname === "phrase hack") {
    limit = one_list ? 0 : 3;
  } else if (listname === "name") {
    limit = one_list ? 0 : 999;
  } else if (listname === "generic") {
    limit = one_list ? 0 : 3;
  } else if (listname === "all") {
    limit = 999;
  }
  // show all available
  // limit = Math.max(limit, available)
  // adjust to screen size
  if (typeof window === "object") {
    /*
     * adjust to screen size
     */
    // 3 columns
    if (window.innerWidth > 1299) {
      if (limit % 3) {
        limit += 3 - (limit % 3);
      }
    }
    // 2 columns
    else if (window.innerWidth > 899) {
      if (limit === 3) {
        limit = 2;
      } else if (limit === 9) {
        limit = 6;
      } else if (limit % 2) {
        limit += 2 - (limit % 2);
      }
    }
    // 1 column
    else {
      if (limit === 3) {
        limit = 2;
      } else if (limit === 6) {
        limit = 4;
      } else if (limit === 9) {
        limit = 6;
      }
    }
  }
  // done
  return limit;
};

class Doms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // ['unlimit_'+listname]: {boolean}
    };
  }

  render() {
    /*
     * User "container" state/props/methods!
     * This "child" component is to simplify container's render() logic.
     */
    let {
      ui = {},
      OriginalMessage = null,
      suggestions_keys = [],
      suggestions_lists = {},
      domain_availability = {},
      input_tld,
      input_str,
      input_spellchecked,
      input_words_arr = [],
    } = this.props;

    /*
     * validate
     */
    if (!suggestions_lists || !Object.keys(suggestions_lists).length) {
      return (
        <DomsStyled className="DomsStyled">
          <div className="content">
            <p>&nbsp;</p>
            <p>loading results......</p>
          </div>
        </DomsStyled>
      );
    }

    /*
     * View
     */
    let written = 0;
    let output = (
      <DomsStyled className={"DomsStyled "}>
        {/*{!!OriginalMessage && <span className="original_message">{OriginalMessage}</span>}*/}
        {/*
         * Results
         */}
        {suggestions_keys.map((listname, listindex) => {
          let list = suggestions_lists[listname] || [];
          let limit = list_limit(listname, !!ui.show_one_list, list.length);
          let label = list_title(listname, !!ui.show_one_list, !ui.show_unavailable);

          /*
           * Limit number of results
           * Show full list if user clicked to expand it,
           * or limit the list items to maximum number.
           */
          if (this.state["unlimit_" + listname]) {
            limit = 1000;
          }

          /*
           * more
           */
          let MoreLink = null;
          if (list.length > limit) {
            MoreLink = (
              <div className="dom_name unlimit">
                <span
                  onClick={() => {
                    this.setState({
                      ["unlimit_" + listname]: true,
                    });
                  }}
                >
                  more &thinsp;
                  <FA className="fa-angle-down" icon={faCaretDown} />
                </span>
              </div>
            );
          } else if (this.state["unlimit_" + listname] === true) {
            MoreLink = (
              <div className="dom_name unlimit">
                <span
                  onClick={() => {
                    this.setState({
                      ["unlimit_" + listname]: false,
                    });
                  }}
                >
                  less &thinsp;
                  <FA className="fa-angle-up" icon={faCaretUp} />
                </span>
              </div>
            );
          }

          /*
           * limit
           */
          list = list.slice(0, limit);

          /*
           * view
           */
          return list.length ? (
            <div key={listname} className={"doms_group "}>
              {!!label && <h5 className="doms_title">{(listindex === 0 ? OriginalMessage : label) || "Loading results"}:</h5>}
              <div className="doms_content">
                {/*
                 * Results
                 */}
                {list.map((phraseString, pi) => {
                  if (phraseString[0] === ".") return null;
                  written++;
                  return (
                    <Dom
                      key={phraseString + pi}
                      listname={listname}
                      phraseString={phraseString}
                      domain_availability={domain_availability}
                      input_tld={input_tld}
                      input_str={input_str}
                      input_spellchecked={input_spellchecked}
                      input_words_arr={input_words_arr}
                    />
                  );
                })}
                {/*
                 * Link to "show more"
                 */}
                {MoreLink}
              </div>
            </div>
          ) : null;
        })}
      </DomsStyled>
    );
    if (written) {
      return output;
    }

    /*
     * No results
     */
    return (
      <DomsStyled className="DomsStyled">
        <div className="content">
          <p>&nbsp;</p>
          <p>Please click the orange "Search" button above.</p>
        </div>
      </DomsStyled>
    );
  }
}

Doms.propTypes = {
  ui: PropTypes.object,
  suggestions_keys: PropTypes.array,
  input_words_arr: PropTypes.array,
  suggestions_lists: PropTypes.object,
  domain_availability: PropTypes.object,
  input_tld: PropTypes.string,
  input_str: PropTypes.string,
  input_spellchecked: PropTypes.string,
};

export default Doms;
