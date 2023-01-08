import React from "react"
import PosWord from "src/wordio/components/EditWord/PosWord"
import { Tooltip } from "antd"
import Tip from "src/shared/components/Tip"

export default class extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      advanced: false
    }
  }

  render() {
    let { field, row, api_actions } = this.props
    /*
     * Validate
     */
    if (!field || !Array.isArray(row[field])) {
      return null
    }
    /*
     * Words to render
     */
    let ListWords = row[field]
      .map((word) => {
        return <PosWord word={word} key={word} row={row} api_actions={api_actions} />
      })
      .filter((val) => !!val)
    /*
     * Render
     */
    return (
      <div className={"ui-form-section"}>
        <div className={"posDiv noselect"}>
          <Tooltip
            title={
              <div className={"Popovercontent help"}>
                {field === "ok_list" && (
                  <>
                    <p>All words with OK/Good sentiment, from any Part-of-Speech.</p>
                    <p>To add, add a word to a specific Part-of-Speech. It will appear here.</p>
                  </>
                )}
                {field === "list" && (
                  <>
                    <p>All words with any sentiment, from any Part-of-Speech.</p>
                    <p>To add, add a word to a specific Part-of-Speech. It will appear here.</p>
                  </>
                )}
              </div>
            }
          >
            <b className="title">{field}:</b>
            <Tip />
          </Tooltip>
        </div>

        {ListWords.length > 0 && (
          <div className={"posDiv"}>
            <div className="posWords">{ListWords}</div>
          </div>
        )}
      </div>
    )
  }
}
