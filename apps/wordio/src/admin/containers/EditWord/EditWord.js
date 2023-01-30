import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as ui_actions from "src/shared/redux/actions/ui";
import * as io_actions from "src/shared/redux/actions/io";
import api_actions from "src/shared/redux/actions/api";
import { StyledPage, StyledSearch } from "src/shared/components/Layout/styles";
import Search from "src/shared/components/Search";
import EditWordResults from "./EditWordResults";
// import Head from "next/head";

class EditWord extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    /*
     * Get word
     */
    this.props.io_actions.RX__set_inputs({ tld: "" });
    setTimeout(() => {
      this.props.io_actions.RX__search_thesaurus();
    }, 500);
  }

  async componentDidUpdate(prevProps) {
    /*
     * Get word
     */
    if (this.props.search_now && this.props.search_now !== prevProps.sdomainsearch_now) {
      this.props.io_actions.RX__search_thesaurus();
    }
  }

  render() {
    let PageContent = null;
    let { word_chunks, input_str } = this.props;
    let row = word_chunks[input_str];
    /*
     * On this "admin" page only, ADD new row:
     *
     * "root", "singular", "plural", "proper", "abbreviation", "acronym"
     */
    if (!row) {
      row = {
        key: input_str,
        pos1: "etc",
        list: [],
        ok_list: [],
        pos_short: { etc: [] },
        poss: { etc: [] },
        dict: {},
      };
      // word_chunks[input_str] = row
    }
    /*
     * Verify Content:
     */
    if (!input_str) {
      PageContent = <p className="content"> Search for a word or phase, above. </p>;
    } else if (!row || !row.key) {
      PageContent = <p className="content">Word or phrase you entered is not found &#9757;</p>;
    } else {
      PageContent = <EditWordResults row={row} that={this} />;
    }
    /*
     * Render content:
     */
    return (
      <>
        <StyledSearch>
          <Search {...this.props} placeholder={"enter a word to edit"} domains={false} cue={[<span key="1">Edit a word in the thesaurus. &#9757;</span>]} />
        </StyledSearch>

        <StyledPage>{PageContent}</StyledPage>
      </>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    ui_actions: bindActionCreators(ui_actions, dispatch),
    io_actions: bindActionCreators(io_actions, dispatch),
    api_actions: bindActionCreators(api_actions, dispatch),
  };
};

const mapStateToProps = function (state) {
  return {
    input_str: state.input.str,
    word_chunks: state.output.chunks,
    search_now: state.input.search_now,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditWord);
