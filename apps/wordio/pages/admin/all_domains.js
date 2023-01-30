import React from "react";
import App from "src/shared/components/Layout";
import AllDomains from "src/admin/containers/AllDomains";

class RootIndex extends React.Component {
  render() {
    return (
      <App>
        <AllDomains />
      </App>
    );
  }
}

export default RootIndex;
