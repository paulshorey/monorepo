import React from "react"
import App from "src/shared/components/App"
import EditWord from "src/shared/containers/Admin/EditWord"
import { withRouter } from "next/router";

class RootIndex extends React.Component {
  render() {
    return (
      <App meta_title={'Edit domain'}>
        <EditWord />
      </App>
    )
  }
}

export default withRouter(RootIndex)
