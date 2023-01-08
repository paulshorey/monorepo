import React from "react"
import Link from "next/link"
import Fields from "./Fields"
import Pos from "./Pos"
import FieldList from "./FieldList"
import { Styled } from "./EditWord.styled"
import { faEye, faTrashAlt } from "@fortawesome/pro-regular-svg-icons"
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome"
import pos_expand from "src/shared/data/words/dict/pos_expand"

export default function (props) {
  /*
   * User "container" state/props/methods!
   * This "child" component is to simplify container's render() logic.
   */
  console.log("EditWordResults.js props", props)
  let that = props.that

  let { api_actions } = that.props
  let row = props.row
  console.log("render row", row)

  let pos_set = new Set([
    row.pos1,
    row.pos2,
    row.pos3,
    row.pos4,
    row.pos5,
    "bef",
    "aft",
    "ety",
    "etc",
    ...Object.keys(pos_expand)
  ])
  let pos_arr = [...pos_set]

  return (
    <Styled className="EditWord content">
      {/*View*/}
      <Link className={"editWordLink"} href={`/thesaurus?str=${that.props.input_str}`}><a>
        <FA icon={faEye} className="faEye" style={{ transform: "scale(0.85)" }} />
      </a></Link>
      <Link
        className={"deleteWordLink"}
        href={`/edit_word?str=${that.props.input_str}`}
        onClick={() => {
          that.props.api_actions.data_word_delete(row.key)
        }}
      ><a>
        <FA icon={faTrashAlt} className="faTrashAlt" style={{ transform: "scale(0.85)" }} />
      </a></Link>
      {/*Key*/}
      <p className="color-attention-dark">
        Edit "<b>{row.str || row.key}</b>":
      </p>
      {/*Fields*/}
      <Fields api_actions={api_actions} row={row} />
      {typeof row.sentiment !== "undefined" && (
        <>
          {/*PoS*/}
          {pos_arr.map((pos, pi) => (
            <Pos api_actions={api_actions} pos={pos} row={row} key={pos + pi} />
          ))}
          {/*Lists*/}
          {["ok_list", "list"].map((field, pi) => (
            <FieldList api_actions={api_actions} field={field} row={row} key={row.key + pi} />
          ))}
        </>
      )}
    </Styled>
  )
}
