import React from "react";
import App from "src/shared/components/Layout";
import EditDomain from "src/admin/containers/EditDomain";

class RootIndex extends React.Component {
  render() {
    return (
      <App meta_title={"Edit domain"}>
        <EditDomain />
      </App>
    );
  }
}

export default RootIndex;
