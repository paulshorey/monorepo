import React from "react"
import { Tag } from "antd"

class Tags extends React.Component {
  render() {
    let Tags = []
    for (let str of this.props.tags) {
      Tags.push(
        <Tag
          key={str}
          closable
          onClose={() => {
            let newtags = this.props.tags.filter((tag) => tag !== str)
            this.props.onChange(newtags)
          }}
        >
          {str}
        </Tag>
      )
    }
    return <div className={"Tags"}>{Tags}</div>
  }
}

export default Tags
