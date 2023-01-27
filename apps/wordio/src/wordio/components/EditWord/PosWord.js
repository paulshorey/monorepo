import React from "react";
import PropTypes from "prop-types";
import { Dropdown, Menu } from "antd";
import Link from "next/link";
import { PosWordStyled } from "./PosWord.styled";
import Definitions from "./Definitions";
import api_actions from "src/shared/redux/actions/api";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { faPen } from "@fortawesome/pro-solid-svg-icons/faPen";
import { faTrash } from "@fortawesome/pro-solid-svg-icons/faTrash";
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";

class PosWord extends React.Component {
  render() {
    let { className = "" } = this.props;
    if (!this.props.row || !this.props.row.key || !this.props.word || this.props.word === " ") {
      return null;
    }
    let menu = (
      <Menu className={"antd-edit-posword-dropdown-menu"}>
        <Menu.Item>
          <Link href={`/edit_word?str=${this.props.word}`} target="_blank">
            <a>
              <FA icon={faPen} className="faPen" style={{ transform: "scale(0.85)" }} /> edit "<b>{this.props.word}</b>"
            </a>
          </Link>
        </Menu.Item>
        <hr />
        <Menu.Item
          className={"color-bad"}
          onClick={() => {
            this.props.api_actions.data_word_remove_words(this.props.row.key, this.props.word);
          }}
        >
          <FA icon={faTrash} className="faTrash" style={{ transform: "scale(0.85)" }} /> remove "
          <b>{this.props.word}</b>"
        </Menu.Item>
        {this.props.info &&
          this.props.info[1] === 0 &&
          this.props.info[2] === 0 &&
          (this.props.info[0] === 0 ? (
            <Menu.Item
              className={"color-accent"}
              onClick={() => {
                this.props.api_actions.data_word_sentiment_of_synonym(this.props.row.key, this.props.word, 1);
                this.props.api_actions.data_word_remove_words(this.props.row.key, this.props.word);
              }}
            >
              make positive, but remove
            </Menu.Item>
          ) : (
            <Menu.Item
              className={"color-bad"}
              onClick={() => {
                this.props.api_actions.data_word_sentiment_of_synonym(this.props.row.key, this.props.word, -1);
                this.props.api_actions.data_word_remove_words(this.props.row.key, this.props.word);
              }}
            >
              mark negative, and remove
            </Menu.Item>
          ))}
        <hr />
        <Menu.Item
          className={"color-black"}
          onClick={() => {
            this.props.api_actions.data_word_sentiment_of_synonym(this.props.row.key, this.props.word, -1);
          }}
        >
          sentiment = negative
        </Menu.Item>
        <Menu.Item
          className={"color-accent"}
          onClick={() => {
            this.props.api_actions.data_word_sentiment_of_synonym(this.props.row.key, this.props.word, 1);
          }}
        >
          sentiment = ok/good
        </Menu.Item>
        <hr />
        <Menu.Item
          className={"color-medium"}
          onClick={() => {
            this.props.api_actions.data_word_proper_of_synonym(this.props.row.key, this.props.word, 1);
          }}
        >
          is Proper/Capitalized
        </Menu.Item>
        <Menu.Item
          className={"color-medium"}
          onClick={() => {
            this.props.api_actions.data_word_proper_of_synonym(this.props.row.key, this.props.word, 0);
          }}
        >
          not proper
        </Menu.Item>
      </Menu>
    );
    // let { row = {}, word = "" } = this.props
    // let list_count = Math.ceil(Math.max(200, ((row.dict || {})[word] || [])[13] || 0) / 2)
    // let length = word.length
    // let total = Math.round((list_count / length) * 10)
    return (
      <PosWordStyled className={"PosWordStyled " + className}>
        {/*
         * word itself
         */}
        <span className={"posword"}>
          <Dropdown
            className="Dropdown"
            overlay={<Definitions api_actions={this.props.api_actions} word={this.props.word} />}
            trigger={["click"]}
          >
            <span className={"posword_word1"}>
              {this.props.word.substr(0, Math.ceil(this.props.word.length * 0.3))}
            </span>
          </Dropdown>
          <Dropdown className="Dropdown" overlay={menu} trigger={["click"]}>
            <span className={"posword_word2"}>{this.props.word.substr(Math.ceil(this.props.word.length * 0.3))}</span>
          </Dropdown>
          {/*<sup>*/}
          {/*  ({list_count}/{length}={total})*/}
          {/*</sup>*/},
        </span>
        {/*
         * sentiment -/+
         */}
        <span className={"posword_sentiment"}>
          {this.props.info && this.props.info[0] < 1 ? (
            <sup className={"plusMinus plus"}>
              <b
                onClick={() => {
                  this.props.api_actions.data_word_sentiment_of_synonym(this.props.row.key, this.props.word, 1);
                }}
              >
                +
              </b>
            </sup>
          ) : (
            <sup className={"plusMinus minus"}>
              <b
                onClick={() => {
                  this.props.api_actions.data_word_sentiment_of_synonym(this.props.row.key, this.props.word, -1);
                }}
              >
                &ndash;
              </b>
            </sup>
          )}
        </span>
        {/*
         * delete x
         */}
        <span className={"posword_sentiment"}>
          <sup className={"deleteWord"}>
            <b
              onClick={() => {
                this.props.api_actions.data_word_remove_words(this.props.row.key, this.props.word);
              }}
            >
              x
            </b>
          </sup>
        </span>
      </PosWordStyled>
    );
  }
}

PosWord.propTypes = {
  api_actions: PropTypes.object.isRequired, // redux actions
  row: PropTypes.object.isRequired, // DB row of the word that this is a synonym of
  word: PropTypes.string.isRequired, // word string - more info passed as {info}
  info: PropTypes.array // [0, 1, 0] - matrix of 0/1 values of word: [sentiment, proper, something]
};

const mapDispatchToProps = (dispatch) => {
  return {
    api_actions: bindActionCreators(api_actions, dispatch)
  };
};

const mapStateToProps = function (state) {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(PosWord);
