import React from "react";
import Head from "next/head";
import Search from "src/wordio/components/Search";
import { StyledHome } from "./WordHome.styled";
import ApiExplorer from "src/wordio/components/ApiExplorer";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as ui_actions from "src/shared/redux/actions/ui";
import api_actions from "src/shared/redux/actions/api";
import * as io_actions from "src/shared/redux/actions/io";

const WordHome = function (props) {
  return (
    <StyledHome>
      <Head>
        <title>Wordio.co</title>
      </Head>
      <Search
        {...props}
        className={"Search Word Home"}
        domains={false}
        title="Word info"
        placeholder="..."
        home={true}
        // cue={[
        //   <div key="1" className="color-subtle">
        //     <span className="color-white">Sentiment</span>, <span className="color-white">synonyms</span>, <span className="color-white">root word</span>,{" "}
        //     <span className="color-white">parts of speech</span>, <span className="color-white">plurals</span>,{" "}
        //     <span className="color-white">abbreviations</span>...
        //   </div>,
        // ]}
      />

      {/* <div className="about_text">
        <p className="content full">☝️ Sentiment analysis built in. Made for better search results and human-machine interaction.</p>
      </div> */}

      <ApiExplorer />
    </StyledHome>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    ui_actions: bindActionCreators(ui_actions, dispatch),
    api_actions: bindActionCreators(api_actions, dispatch),
    io_actions: bindActionCreators(io_actions, dispatch),
  };
};

const mapStateToProps = function (state) {
  return {
    ui: state.ui,
    word_input: state.input.str,
    word_chunks: state.output.chunks,
    search_now: state.input.search_now,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WordHome);
