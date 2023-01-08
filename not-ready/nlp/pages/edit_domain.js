import React from "react"
import App from "src/shared/components/App"
import EditDomain from "src/shared/containers/Admin/EditDomain"

class RootIndex extends React.Component {
  render() {
    return (
      <App meta_title={'Edit domain'}>
        <EditDomain />
      </App>
    )
  }
}

export default RootIndex
