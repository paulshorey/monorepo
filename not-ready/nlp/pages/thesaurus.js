import React from "react";
import App from "src/shared/components/App";
import Word from "src/wordio/containers/Word";
// import Footer from "src/shared/components/Footer"
import ContextUrlParams from "src/shared/context/UrlParams";

class RootIndex extends React.Component {
  static getInitialProps({ query }) {
    return { query };
  }
  render() {
    return (
      <ContextUrlParams.Provider value={this.props.query}>
        <App meta_title={"Thesaurus"}>
          <Word />
        </App>
      </ContextUrlParams.Provider>
    );
  }
}

export default RootIndex;
