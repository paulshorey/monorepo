import React from "react";
import { Select, Input, Tooltip } from "antd";
import { FieldsStyled } from "./Fields.styled";
import arr_truthy_values from "@techytools/fn/io/arr/arr_truthy_values";
import objects_are_equal from "@techytools/fn/io/objects/objects_are_equal";
import Tags from "src/admin/components/Tags";
import Tip from "src/admin/components/Tip";
import DomExt from "../EditDomain/DomExt";
import pos_expand from "src/shared/data/words/function/pos_expand";
import stopwords from "src/shared/data/words/stopwords";

const { Option } = Select;

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prevFormData: {},
    };
  }

  submitFields = async () => {
    // validate
    if (objects_are_equal(this.state.prevFormData, this.state.formData)) {
      return false;
    }
    // process
    let formData = { ...this.state.formData };
    this.setState({
      prevFormData: JSON.parse(JSON.stringify(formData)),
    });
    // fix pos
    // conform component state to DB row data structure
    let pos = formData.pos;
    delete formData.pos;
    if (pos) {
      formData.pos1 = (pos[0] || "").trim().substring(0, 3);
      formData.pos2 = (pos[1] || "").trim().substring(0, 3);
      formData.pos3 = (pos[2] || "").trim().substring(0, 3);
      formData.pos4 = (pos[3] || "").trim().substring(0, 3);
      formData.pos5 = (pos[4] || "").trim().substring(0, 3);
    }
    // save
    console.log("formData", formData);
    await this.props.api_actions.data_word_edit(formData);
  };

  async componentDidMount() {
    this.setState_formData_fromRow(this.props.row);
  }

  async componentDidUpdate(prevProps) {
    if (this.props.row && this.props.row !== prevProps.row) {
      this.setState_formData_fromRow(this.props.row);
    }
  }

  /**
   * This function is called from React Lifecycle,
   * to sync state with props
   * It not called by user input.
   */
  setState_formData_fromRow = (row) => {
    console.log("setState_formData_fromRow row", row);
    let formData = {
      key: row.key,
      root: row.root,
      singular: row.singular,
      plural: row.plural,
      proper: row.proper,
      abbreviation: row.abbreviation,
      acronym: row.acronym,
      ctr: row.ctr,
      ws_sentiment: row.ws_sentiment,
      tlds0: row.tlds0,
      // pos: arr_truthy_values([row.pos1, row.pos2, row.pos3, row.pos4, row.pos5]).toString().replace(/,/g, ', '),
      pos: arr_truthy_values([row.pos1, row.pos2, row.pos3, row.pos4, row.pos5].map((str) => pos_expand(str))),
    };
    // recipes, restaurant, kitchen, cooking
    this.setState({
      domains: row.tlds ? ["_0_", ...(row.tlds[0] || []), "_1_", ...(row.tlds[1] || []), "_2_", ...(row.tlds[2] || []), "_3_", ...(row.tlds[3] || [])] : [],
      best_of: (row.pos_short || {}).all || [],
      formData: formData,
      prevFormData: JSON.parse(JSON.stringify(formData)),
      //   ['function / auxillary', row.aux],
      //   ['interrogative', row.pos1 === "ive" || (row.pos1 === "adv" && row.aux) || (row.pos1 === "ver" && row.aux)],
      //   ['name', row.name],
      //   ['brand', row.brand],
      //   ['tech', row.tech],
      tips: {
        "function / auxillary": "not to be used as a word by itself, but only with another word - the other word will give meaning to this one",
        interrogative: "signals a questioning of, or inquiring about",
        name: "Proper name, usually of a person",
        brand: "1) we recognize this from our list of brand names, or 2) we could not parse this jumble of text, assuming its some brand name",
        root: (
          <>
            root word, word in its simplest form
            <hr />
            (put singular into its own field below)
          </>
        ),
        singular: (
          <>
            if "singular" form exists, should go here <hr />
            if same as root, please delete the root
          </>
        ),
        plural: (
          <>
            if "plural" form exists, should go here <hr />
            if same as root, please delete the root
          </>
        ),
        proper: (
          <>
            if word should be capitalized, write capitalized version here <hr />
            usually its same as the word, but with uppercase first letter,
            <br />
            but rarely proper version may be totally different
          </>
        ),
        abbreviation: <>abbreviation of education is "edu"</>,
        acronym: <>acronym of "in real life" is "IRL"</>,
        ctr: <>contraction - enter correct spelling - Example: "y'all" for key "yall"</>,
        tlds0: (
          <>
            specify TLDs which should always be used with this word (optional)
            <hr />
            for especially sensitive and important words like "covid" or "blm" <hr />
            also for any word if the modern cultural meaning is very different from the dictionary definition, like "trump". Also for names of people or places
            which may not be in the dictionary, like "obama".
          </>
        ),
      },
    });
  };

  render() {
    let { row } = this.props;
    let { formData } = this.state;
    if (!formData) {
      return <p>Loading...</p>;
    }
    let stopword = !!stopwords[formData.key];
    return (
      <FieldsStyled className={"Fields ui-form-fieldset-grid ui-form-section"}>
        {/*
         * Best of
         */}
        {!!(this.state.best_of && this.state.best_of.length) && (
          <div className="ui-form-fieldset">
            <Tooltip className="label" title={"Best domains. Few negative results may enter this list, if the entire word is very negative."}>
              <span>best:</span>
              <Tip /> &nbsp;
            </Tooltip>
            <span className="value">{this.state.best_of.join(", ")}</span>
          </div>
        )}

        {/*
         * Domains
         */}
        {!!(this.state.domains && this.state.domains.length) && (
          <div className="ui-form-fieldset">
            <span className="label">domains:</span>
            <span className="value">
              {this.state.domains.map((dom, i) => (
                <DomExt key={dom + i} domext={dom} />
              ))}
            </span>
          </div>
        )}

        {/*
         * Simple inputs
         */}
        {["root", "singular", "plural", "proper", "abbreviation", "acronym", "ctr", "tlds0"].map((name) => {
          return (
            <div className="ui-form-fieldset" key={name}>
              <div className={"label"}>
                <Tooltip title={this.state.tips[name]}>
                  <span className={"noselect"}>{name}:</span>
                  <Tip />
                </Tooltip>
              </div>
              <div className={"value"}>
                <Input
                  className={"minimal"}
                  // size="small"
                  value={formData[name] || ""}
                  onChange={(event) => {
                    this.setState({
                      formData: { ...formData, [name]: event.target.value },
                    });
                  }}
                  onBlur={this.submitFields}
                />
              </div>
            </div>
          );
        })}

        {/*
         * ws_sentiment
         */}
        <div className={"ui-form-fieldset"}>
          <div className={"label"}>
            <Tooltip title={<p className={"Popovercontent help"}>Good/OK are interchangeable. Bad is what matters.</p>}>
              <span className={"noselect"}>sentiment:</span>
              <Tip />
            </Tooltip>
          </div>
          <div className={"value"}>
            <Select
              value={formData["ws_sentiment"]}
              onChange={(value) => {
                this.setState(
                  {
                    formData: { ...formData, ws_sentiment: Number(value) },
                  },
                  this.submitFields
                );
              }}
            >
              <Option value="">choose</Option>
              <Option value="1">1 (Positive)</Option>
              <Option value="0">0 (Neutral)</Option>
              <Option value="-1">-1 (Bad)</Option>
            </Select>
          </div>
        </div>

        {/*
         * pos
         */}
        <div className={"ui-form-fieldset postags"}>
          <div className={"label"}>
            <Tooltip
              title={
                <div className={"help"}>
                  <p>Required:</p>
                  <p>
                    The order of all synonyms below depends on this.
                    <br />
                    Enter comma-separated list of parts-of-speech, <b>in order !</b>
                  </p>
                  <p>
                    Choices are:
                    <br />
                    nouns, verbs, adverbs, adjectives, interjections, ctrs, determiners, pronouns, prepositions
                  </p>
                </div>
              }
            >
              <span className={"noselect"}>parts of speech:</span>
              <Tip />
            </Tooltip>
          </div>
          <div className={"value"}>
            <Select
              value={""}
              onChange={(value) => {
                let pos = this.state.formData.pos;
                if (!pos.includes(value) && value) {
                  pos.unshift(value);
                }
                this.setState(
                  {
                    formData: { ...formData, pos: pos },
                  },
                  this.submitFields
                );
              }}
            >
              <Option value="">+&nbsp;</Option>
              <Option value="nouns">nouns</Option>
              <Option value="verbs">verbs</Option>
              <Option value="adverbs">adverbs</Option>
              <Option value="adjectives">adjectives</Option>
              <Option value="interjections">interjections</Option>
              <Option value="ctrs">ctrs</Option>
              <Option value="determiners">determiners</Option>
              <Option value="prepositions">prepositions</Option>
              <Option value="pronouns">pronouns</Option>
            </Select>

            <Tags
              tags={formData.pos}
              onChange={(newpos) => {
                this.setState(
                  {
                    formData: { ...formData, pos: newpos },
                  },
                  this.submitFields
                );
              }}
            />
          </div>
        </div>

        {/*/!**/}
        {/* * derivations*/}
        {/* *!/*/}
        {/*<div className={"ui-form-fieldset"}>*/}
        {/*  <div className={"label"}>*/}
        {/*    <Tooltip title={"comma, separated, list"}>*/}
        {/*      <span>derivations:</span>*/}
        {/*      <Tip />*/}
        {/*    </Tooltip>*/}
        {/*  </div>*/}
        {/*  <div className={"value flexgrow"}>*/}
        {/*    <Input*/}
        {/*      className={""}*/}
        {/*      value={formData["derivations"]}*/}
        {/*      onChange={(event) => {*/}
        {/*        this.setState({*/}
        {/*          formData: { ...formData, derivations: event.target.value }*/}
        {/*        })*/}
        {/*      }}*/}
        {/*      onBlur={this.submitFields}*/}
        {/*    />*/}
        {/*  </div>*/}
        {/*</div>*/}
        {/*
         * Is ...?
         */}
        {!!row &&
          [
            ["function / auxillary", row.aux],
            ["interrogative", row.pos1 === "ive" || (row.pos1 === "adv" && row.aux) || (row.pos1 === "ver" && row.aux)],
            ["name", row.name],
            ["brand", row.brand],
            ["tech", row.tech],
          ].map((tuple) => {
            if (tuple[1]) {
              return (
                <div className="ui-form-fieldset">
                  <Tooltip className="label" title={this.state.tips[tuple[0]]}>
                    <span className="color-attention">is {tuple[0]}:</span>
                    <Tip /> &nbsp;
                  </Tooltip>
                  <span className="value color-bad">true</span>
                </div>
              );
            }
          })}
        {/*
         * Count?
         */}
        {!!row && !!row.list_count && (
          <div className="ui-form-fieldset">
            <Tooltip className="label" title={"It might, however, be displayed to visitors of NLP Thesaurus"}>
              <span>n synonyms:</span>
              <Tip /> &nbsp;
            </Tooltip>
            <span className="value">{row.list_count}</span>
          </div>
        )}
        {/*
         * Stopword?
         */}
        {stopword && (
          <div className="ui-form-fieldset">
            <Tooltip className="label" title={"It might, however, be displayed to visitors of NLP Thesaurus"}>
              <span className="color-bad">STOPWORD:</span>
              <Tip /> &nbsp;
            </Tooltip>
            <span className="value color-bad">This word will not be used in domain suggestions.</span>
          </div>
        )}
      </FieldsStyled>
    );
  }
}
