import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button, Input } from "antd";
import { faPlus } from "@fortawesome/pro-solid-svg-icons/faPlus";
import { faTrash } from "@fortawesome/pro-solid-svg-icons/faTrash";
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";

const InputGroup = (props) => {
  const { word, pos, api_actions, className = "", defaultValue = "", value = "" } = props;
  /*
   * update value from parent
   */
  const [addWords, set_addWords] = useState(defaultValue);
  useEffect(() => {
    set_addWords(value);
  }, [value]);
  /*
   * view
   */
  return (
    <span className={`flexgrow ui-field-input-group ${className}`}>
      <Input
        type={"text"}
        placeholder={`add synonyms to ${pos}...`}
        value={addWords}
        onChange={(event) => {
          set_addWords(event.target.value);
        }}
        onKeyPress={(event) => {
          if (event.key === "∂") {
            api_actions.data_word_remove_words(word, addWords);
            set_addWords("");
          }
          if (event.key === "Enter") {
            api_actions.data_word_add_poswords(word, pos, addWords);
            set_addWords("");
          }
        }}
      />
      <Button
        type={"primary"}
        onClick={() => {
          api_actions.data_word_add_poswords(word, pos, addWords);
          set_addWords("");
        }}
      >
        {addWords.split(",").filter((w) => w.trim()).length || ""}
        <FA icon={faPlus} className="faPlus" style={{ transform: "scale(0.85)" }} />
      </Button>
      <Button
        className={"color-bad"}
        onClick={() => {
          api_actions.data_word_remove_words(word, addWords);
          set_addWords("");
        }}
      >
        <FA icon={faTrash} className="faTrash" style={{ transform: "scale(0.85)" }} />
      </Button>
    </span>
  );
};

InputGroup.propTypes = {
  api_actions: PropTypes.object.isRequired, // redux actions
  word: PropTypes.string.isRequired, // `row.key` of word that is being edited
  pos: PropTypes.string.isRequired // part of speech. ex: "nouns"
};

export default InputGroup;
