import { StyledResults } from "./EditDomain.styled"
import { Button, Input } from "antd"
import Link from "next/link"
import PosWord from "src/wordio/components/EditWord/PosWord"
import React from "react"
import { faPen, faSave, faArrowUp, faArrowDown } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome"
import AllDomains from "./AllDomains"

const { TextArea } = Input

export default function (props) {
  /*
   * User "container" state/props/methods!
   * This "child" component is to simplify container's render() logic.
   */
  let { that } = props
  let { dom, synsDict } = that.state

  /*
   * Render:
   */
  return (
    <StyledResults className="EditDomainResults">
      {/*
       * FORM (.syns1)
       */}
      {!!that.state.stopword && (
        <section className={"domain-section domain-edit"}>
          <p>
            "<b>.{that.state.stopword}</b>" is a "
            <a href="https://www.google.com/search?q=stopword" target="_blank">
              stopword
            </a>
            ". Please select a TLD which is an English word which is common and not abbreviated (chose "
            <Link href="?tld=law"><a>.law</a></Link>" or "<Link href="?tld=cat"><a>.cat</a></Link>" instead of ".com").
          </p>
        </section>
      )}
      <section className={"domain-section domain-edit"}>
        <h3>Edit ".{dom.key}" synonyms-of-synonyms (words to be extrapolated):</h3>
        <div className={"flexrow posDiv"}>
          <span className={"flexgrow ui-field-input-group"}>
            <Input
              type={"text"}
              placeholder={"comma, separated, words, to add to OK terms..."}
              value={dom.syns1}
              onChange={(event) => {
                that.setState({
                  dom: {
                    ...dom,
                    syns1: event.target.value
                  }
                })
              }}
              onKeyPress={async (event) => {
                if (event.key === "Enter") {
                  that.submit_state_dom()
                }
              }}
            />
            <Button
              type={"primary"}
              onClick={async () => {
                that.submit_state_dom()
              }}
            >
              <FA icon={faPen} className="faPen" style={{ transform: "scale(0.85)" }} />
              <b>&nbsp;+&nbsp;</b>
              <FA icon={faSave} className="faSave" style={{ transform: "scale(0.85)" }} />
            </Button>
          </span>
        </div>
      </section>

      {/*
       * RESULTS (synonyms of each word)
       */}
      {synsDict && Object.keys(synsDict).length > 0 && (
        <section className={"domain-section domain-view"}>
          {/*<div className="cue">*/}
          {/*  user will see "<b>.{dom.key}</b>" extension if they type in any of these words:{" "}*/}
          {/*</div>*/}
          <div className={"domain-syns-paragraph columns"}>
            {Object.entries(synsDict).map((tuple, i) => {
              let key = tuple[0]
              let list = tuple[1]
              return (
                <div key={key + i + "col"} className="column">
                  <h3 className="dictKey" style={{ userSelect: "none" }}>
                    <Link href={"/edit_word?str=" + key} target="_blank"><a>
                      {key}&thinsp;&thinsp;
                      <FA icon={faArrowDown} className="faArrowDown" style={{ transform: "scale(0.85)" }} />
                    </a></Link>
                  </h3>
                  <div>
                    {list.map((str, i) =>
                      str.indexOf("_") !== 0 ? (
                        <PosWord key={str + i + "str"} word={str} row={{ key: key }} className="dictLine syns2">
                          {str},
                        </PosWord>
                      ) : (
                        <div key={str + i + "str"} className="dictLine syns3">
                          {str.replace(/_/g, "")}
                        </div>
                      )
                    )}
                  </div>
                  <h3 className="dictKey" style={{ userSelect: "none" }}>
                    <Link href={"/edit_word?str=" + key} target="_blank"><a>
                      <FA icon={faArrowUp} className="faArrowUp" style={{ transform: "scale(0.85)" }} />
                      &thinsp;&thinsp;{key}
                    </a></Link>
                  </h3>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/*
       * FORM (.syns)
       */}
      <section className={"domain-section domain-edit"}>
        <h3>Edit ".{dom.key}" direct-synonyms (these words will be used as-is, will NOT be extrapolated):</h3>
        {/*<p><b className="color-attention">IMPORTANT: please put in this format: <code>"comma", "separated", "in", "quotes"</code></b></p>*/}
        <div className={"posDiv"}>
          <span className={"flexgrow ui-field-input-group"}>
            <TextArea
              placeholder="comma, separated, words, to add to OK terms..."
              rows={20}
              value={dom.syns}
              onChange={(event) => {
                that.setState({
                  dom: {
                    ...dom,
                    syns: event.target.value
                  }
                })
              }}
              onKeyPress={async (event) => {
                if (event.key === "Enter") {
                  that.submit_state_dom()
                }
              }}
            />
            <Button
              type={"primary"}
              onClick={async () => {
                that.submit_state_dom()
              }}
            >
              <FA icon={faPen} className="faPen" style={{ transform: "scale(0.85)" }} />
              <b>&nbsp;+&nbsp;</b>
              <FA icon={faSave} className="faSave" style={{ transform: "scale(0.85)" }} />
            </Button>
          </span>
        </div>
      </section>
    </StyledResults>
  )
}
