import React from "react"
import { StyledDemo } from "./Demo.styled"

class ThisComponent extends React.Component {
  render() {
    let { location = {}, home, domains } = this.props
    if (!home || !domains) {
      return null
    }

    let className = " bestadomains"
    // console.log("location.host", location.host)
    // if (typeof window === "object") {
    //   window.lhost = location.host
    // }
    // if (location.host) {
    //   if (location.host.includes("name")) {
    //     className += " bestaname"
    //   } else {
    //     className += " bestadomains"
    //   }
    // }

    return (
      <StyledDemo className={"DemoContainer" + className}>
        <div className="content DemoContent">
          <div className={"Demo"}> </div>
          {/*<div className="download_button">*/}
          {/*  <a href="/examples/pdf/beta-release.pdf" download>*/}
          {/*    <img src="/examples/pdf/beta-release.svg" alt="download pdf" />*/}
          {/*  </a>*/}
          {/*</div>*/}
        </div>
      </StyledDemo>
    )
  }
}

export default ThisComponent
