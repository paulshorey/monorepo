import React from "react";
import App from "src/shared/components/App";
import Domains from "src/domains/containers/Results";
import Footer from "src/shared/components/Footer";
import ContextUrlParams from "src/shared/context/UrlParams";

class ResultsIndex extends React.Component {
  static getInitialProps({ query }) {
    return { query };
  }
  render() {
    return (
      <ContextUrlParams.Provider value={this.props.query}>
        <App>
          <Domains />
          <Footer />
        </App>
      </ContextUrlParams.Provider>
    );
  }
}

export default ResultsIndex;
