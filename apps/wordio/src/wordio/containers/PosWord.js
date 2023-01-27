import React from "react"
import { Menu } from "antd"
import Link from "next/link"

class Definitions extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      definitions: []
    }
  }

  componentDidMount() {
    this.props.api_actions.definitions_list_get(this.props.word).then((defs) => {
      this.setState({
        definitions: defs
      })
    })
  }

  render() {
    if (!this.state.definitions || !Array.isArray(this.state.definitions)) {
      return null
    }
    let List = []
    for (let def of this.state.definitions) {
      List.push(<Menu.Item>{def}</Menu.Item>)
    }
    return <Menu className={"antd-word-definitions-dropdown-menu"}>{List}</Menu>
  }
}

class PosWord extends React.Component {
  render() {
    let { word, api_actions } = this.props
    if (!word || word === " ") {
      return null
    }
    return (
      <>
        {/*<Dropdown overlay={<Definitions api_actions={api_actions} word={word}/>} trigger={['contextMenu']}>*/}
        <span className={"posword"}>
          {/*{word},*/}
          <Link href={`/thesaurus?str=${word}`} className="color-medium"><a>
            {word}
          </a></Link>
          ,&nbsp;
        </span>
        {/*</Dropdown>*/}
      </>
    )
  }
}

export default PosWord
