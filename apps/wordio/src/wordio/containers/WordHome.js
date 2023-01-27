import React from "react";
import Head from "next/head";
import Search from "src/shared/components/Search";
import { StyledHome } from "./WordHome.styled";
import ApiExplorer from "src/wordio/components/ApiExplorer";

export default function (props) {
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
}
