import React from "react"
import { ColorsStyled } from "./Domains.styled"
import { LegendStyled } from "./Legend.styled"

const Legend = function (props) {
  /*
   * User "container" state/props/methods!
   * This "child" component is to simplify container's render() logic.
   */
  let that = props.that
  /*
   * options
   */
  let use_word_hacks = !!that.props.suggestions_options.use_word_hacks
  if (that.props.domain_suggested && (!that.props.domain_suggested['word hacks'] || !that.props.domain_suggested['word hacks'].length)) {
    use_word_hacks = false
  }
  /*
   * View
   */
  return (
    <LegendStyled className={"LegendStyled" + (props.className ? " " + props.className : "")}>
      <ColorsStyled className="ColorsStyled">

      </ColorsStyled>
    </LegendStyled>
  )
}

export default Legend
