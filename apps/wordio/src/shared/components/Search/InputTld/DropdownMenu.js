import React from "react";
import { connect } from "react-redux";
import { Styled } from "./DropdownMenu.styled.js";
import { sort_strings_by_rating } from "@techytools/fn/io/sort_strings";

class DropdownMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let { arrow_index, filter, focused, handleSelect, input_tld, tlds_all } = this.props;
    if (!tlds_all) {
      return null;
    }
    // rate each filtered tld by relevance
    // will [].sort the list by these ratings
    // all filtered results will already match all characters in `filter` str
    // rating = ratio of matched `filter` letters compared to entire `tld` str
    // highest rating is 1, lowest is closer to 0, but never 0
    // tlds_ratings is a dictionary of {string:rating,}
    let tlds_ratings = {};
    // make list of filtered tlds
    let tlds_matched = [];
    if (input_tld && input_tld.includes(filter)) {
      tlds_matched.push(input_tld);
      tlds_ratings[input_tld] = filter.length / input_tld.length;
    }
    for (let tld in tlds_all) {
      // skip pre-selected
      if (tld === input_tld) continue;
      // filter
      if (!tld.includes(filter)) continue;
      // add
      tlds_matched.push(tld);
      tlds_ratings[tld] = filter.length / tld.length;
    }
    // sort by rating
    tlds_matched = sort_strings_by_rating(tlds_matched, tlds_ratings);
    // show selected - for user to browse with Up/Down arrows
    let selected_i = 0;
    if (arrow_index && arrow_index > 0 && arrow_index < tlds_matched.length) {
      selected_i = arrow_index;
    }
    // force submit - if user clicks Enter while pushing Up/Down arrows
    if (this.props.forceSelect) {
      if (tlds_matched[arrow_index] && tlds_matched[arrow_index]) {
        // wait to call until just after render() is finished
        setTimeout(() => {
          handleSelect(tlds_matched[arrow_index]);
        });
      }
    }
    // if only one matched, and is new value, auto-select it
    // if (filter && tlds_matched.length === 1 && tlds_matched[0] !== input_tld && filter === tlds_matched[0]) {
    //   setTimeout(() => {
    //     handleSelect(tlds_matched[0])
    //   }
    // }

    return (
      <Styled className={"dropdown " + (focused ? "visible" : "hidden")}>
        {/*<div className="categories">*/}
        {/*  type something, to search 1000 extensions --<br />*/}
        {/*  or browse categories below:*/}
        {/*</div>*/}
        <div className="tlds">
          {tlds_matched.map((tld, i) => (
            <p
              className={"tld" + (selected_i === i ? " selected" : "")}
              key={tld + i}
              onClick={() => {
                console.log("onClick DropdownMenu.js", tld);
                handleSelect(tld);
              }}
            >
              {tld}
            </p>
          ))}
        </div>
      </Styled>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {};
};

const mapStateToProps = function (state) {
  return {
    input_tld: state.input.tld, // string
    tlds_all: state.output.tlds_all,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DropdownMenu);
