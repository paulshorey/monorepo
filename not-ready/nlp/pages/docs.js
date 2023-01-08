import React from "react";
import App from "src/shared/components/App";
import Header from "src/shared/components/Header";
import { withRouter } from "next/router";
const HOST = process.env.NEXT_PUBLIC_HOST;

const iframeStyle = {
  border: "none",
  height: "calc(100vh - 2.5rem)"
};

class RootIndex extends React.Component {
  render() {
    return (
      <App meta_title={"Contact us"}>
        {/*
         * Header
         */}
        <Header standalone={true} wide={true} hidebeta={true} />

        {/*
         * Page
         */}
        <iframe
          src={"https://nlp.studio" + (HOST === "wordio.co" ? "#text-analysis" : "")}
          width="100%"
          height="1000px"
          style={iframeStyle}
        />
      </App>
    );
  }
}

export default withRouter(RootIndex);
