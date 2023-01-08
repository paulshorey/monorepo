import React from "react"
import App from "src/shared/components/App"
import About from "src/shared/containers/About"
import Footer from "src/shared/components/Footer"

class RootIndex extends React.Component {
  render() {
    return (
      <App meta_title={"Contact us"}>
        <About open_contact={true} />
        <Footer />
      </App>
    )
  }
}

export default RootIndex
