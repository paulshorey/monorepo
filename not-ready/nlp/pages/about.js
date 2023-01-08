import React from "react"
import App from "src/shared/components/App"
import Footer from "src/shared/components/Footer"
import About from "src/shared/containers/About"

class RootIndex extends React.Component {
  render() {
    return (
      <App meta_title={"About us"}>
        <About />
        <Footer />
      </App>
    )
  }
}

export default RootIndex
