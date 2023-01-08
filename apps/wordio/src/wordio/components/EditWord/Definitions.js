import React from "react"
import { Menu } from "antd"

class Definitions extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      definitions: []
    }
  }

  async componentDidMount() {
    let defs = await this.props.api_actions.definitions_list_get(this.props.word)
    if (defs) {
      this.setState({
        definitions: defs
      })
    } else {
      this.setState({
        definitions: ["not found"]
      })
    }
  }

  render() {
    let List = []
    if (this.state.definitions && Array.isArray(this.state.definitions)) {
      let di = 0
      for (let def of this.state.definitions) {
        List.push(<Menu.Item key={di}>{def}</Menu.Item>)
        di++
      }
    }
    if (!List.length) {
      List.push(<Menu.Item key={1}>...loading definition...</Menu.Item>)
    }
    return <Menu className={"antd-word-definitions-dropdown-menu"}>{List}</Menu>
  }
}

export default Definitions
