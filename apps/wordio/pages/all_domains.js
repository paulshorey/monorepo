import React from "react"
import App from "src/shared/components/App"
import AllDomains from "src/shared/containers/Admin/AllDomains"

class RootIndex extends React.Component {
  render() {
    return (
      <App>
        <AllDomains />
      </App>
    )
  }
}

export default RootIndex
