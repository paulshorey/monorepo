import React from "react"
import { bindActionCreators } from "redux"
import { connect } from "react-redux"
import { Styled } from "src/pages/Admin/AddWordToOthers/AddWordToOthers.styled"
import api_actions from "src/shared/redux/actions/api"
import { Button, Select, Input } from "antd"
import { StyledButtonset } from "src/Layout.styled"
import { faPen } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome"

const { Option } = Select

class ViewWord extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      words: [],
      pos: ""
    }
  }

  resetForm = () => {
    this.setState({
      words: [],
      pos: ""
    })
  }

  submitFields = () => {
    this.props.api_actions.data_word_add_to_others({
      word: this.props.word_input,
      pos: this.state.pos,
      addtoothers: this.state.words
    })
    this.resetForm()
  }

  render() {
    //window.doneLoading('render')
    let { word_chunks, word_input, api_actions } = this.props
    let row = word_chunks[0]
    /*
     * Nothing queried yet:
     */
    if (!word_input) {
      return <p>Type a word or phrase &#9757;</p>
    }
    /*
     * No word found:
     */
    if (!row || !row.key) {
      return (
        <h4>
          No word found for "<b>{word_input}</b>"
        </h4>
      )
    }
    /*
     * Render word:
     */
    return (
      <>
        <Styled className="AddWordToOthers content">
          {/*
           * form fields
           */}
          <div className={"ui-form-section noborder"}>
            <h3>
              Add "<b>{word_input}</b>" to
            </h3>
            <Input
              value={this.state.words}
              placeholder={"these words, comma, separated"}
              onChange={(event) => {
                this.setState({
                  words: event.target.value
                })
              }}
            />

            <p>&nbsp;</p>
            <p>
              What Part-of-Speech is "<b>{word_input}</b>"? <br />
              <span className={"color-light"}>(when added to above words)</span>
            </p>
            <Select
              value={this.state.pos}
              onChange={(value) => {
                this.setState({
                  pos: value
                })
              }}
            >
              <Option value="">choose one</Option>
              <Option value="nouns">nouns</Option>
              <Option value="verbs">verbs</Option>
              <Option value="adverbs">adverbs</Option>
              <Option value="adjectives">adjectives</Option>
              <Option value="interjections">interjections</Option>
              <Option value="conjunctions">conjunctions</Option>
              <Option value="determiners">determiners</Option>
              <Option value="prepositions">prepositions</Option>
              <Option value="pronouns">pronouns</Option>
            </Select>
          </div>

          {/*
           * submit
           */}
          <StyledButtonset>
            <Button size={"large"} type={"primary"} onClick={this.submitFields}>
              <FA icon={faPen} className="faPen" style={{ transform: "scale(0.85)" }} />
              <span>&nbsp;Save</span>
            </Button>
          </StyledButtonset>
        </Styled>
      </>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    api_actions: bindActionCreators(api_actions, dispatch)
  }
}

const mapStateToProps = function (state) {
  return {
    word_input: state.input.input
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewWord)
