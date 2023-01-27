import React from "react"
import DomExt from "./DomExt"

class AllDomains extends React.Component {
  render() {
    let { that, dom } = this.props
    if (!that.props.domext) {
      return null
    }
    return (
      <section className={"domain-section domain-view"}>
        <div>
          <b>all domains: &nbsp;</b>
        </div>
        <p className={"domain-syns-paragraph"}>
          {that.tlds_all.map((d, i) => (
            <DomExt key={d + i} row={d} domext={dom.key} />
          ))}
        </p>
      </section>
    )
  }
}

export default AllDomains
