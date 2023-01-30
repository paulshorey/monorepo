import React from "react";
// import ContentEditable from "react-contenteditable"
import { Tooltip } from "antd";
import Tip from "src/admin/components/Tip";
import Hint from "src/admin/components/Hint";
import PosWord from "src/wordio/components/EditWord/PosWord";
// import PosWordView from "../../Word/PosWord"
// import api_actions from "src/shared/redux/actions/api"
import InputGroup from "src/wordio/components/EditWord/InputGroup";
import pos_expand from "src/shared/data/words/dict/pos_expand";

class Pos extends React.Component {
  constructor(props) {
    super(props);
    this.contentEditable = React.createRef();
    this.state = {
      addwords: "",
      xpos_n: null,
    };
  }

  render() {
    let { pos, row, api_actions } = this.props;
    console.log("render pos", pos);
    /*
     * Validate
     */
    if (!pos) {
      return null; // its ok, probably empty row.pos3
    }
    /*
     * slice of row.dict,
     * with before/after
     */
    let slist_n = 0;
    let slist = {};
    for (let word in row.dict) {
      let info = row.dict[word];
      if ((pos === "bef" && info[11] === "bef") || (pos === "aft" && info[11] === "aft") || pos === info[9]) {
        slist[word] = info;
        slist_n++;
      }
    }
    /*
     * shortened preview
     */
    let slist_shorter = (row.pos_short && row.pos_short[pos]) || [];
    console.log("row", row);
    let ListShorter = slist_shorter.map((word) => <span key={word}>{word}, </span>);
    /*
     * Hide empty ? or show all POS
     */
    // if (!slist_n && pos !== "bef" && pos !== "aft" && pos !== "ety") {
    //   return null
    // }
    /*
     * Predefined lists of words
     * info = [ 0-1 (bad-ok), 0-1 (ok-proper), 0-1 (ok-unknown) ]
     * ok = [ 1, 0, 0 ]
     */
    let ListOk = Object.entries(slist)
      .map((tuple) => {
        let [word, info] = tuple;
        if (info[0] === 1 && info[1] === 0 && info[12] === 1) {
          return <PosWord info={info} row={row} key={word} word={word} api_actions={api_actions} />;
        }
      })
      .filter((val) => !!val);
    let ListBad = Object.entries(slist)
      .map((tuple) => {
        let [word, info] = tuple;
        if (info[0] === 0 && info[1] === 0 && info[12] === 1) {
          return <PosWord info={info} row={row} key={word} word={word} api_actions={api_actions} />;
        }
      })
      .filter((val) => !!val);
    let ListProper = Object.entries(slist)
      .map((tuple) => {
        let [word, info] = tuple;
        if (info[1] === 1 && info[12] === 1) {
          return <PosWord info={info} row={row} key={word} word={word} api_actions={api_actions} />;
        }
      })
      .filter((val) => !!val);
    let ListUnknown = Object.entries(slist)
      .map((tuple) => {
        let [word, info] = tuple;
        if (info[2] === 1 && info[12] === 1) {
          return <PosWord info={info} row={row} key={word} word={word} api_actions={api_actions} />;
        }
      })
      .filter((val) => !!val);
    /*
     * Limit ListOk (xpos_n)
     */
    // default value:
    let xpos = "x" + pos.substring(0, 3);
    let xpos_n = 30;
    // if value set in database (could be 0):
    if (row[xpos] !== null && row[xpos] !== undefined) {
      xpos_n = row[xpos];
    }
    // if value set by user (could be 0):
    if (this.state.xpos_n !== null) {
      xpos_n = this.state.xpos_n;
    }
    // user set new value:
    // ListOk.splice(
    //   Number(xpos_n),
    //   0,
    //   <div key="break30" className="break30 noselect">
    //     ---
    //     <ContentEditable
    //       className="noselect"
    //       contentEditable="false"
    //       innerRef={this.contentEditable}
    //       html={xpos_n + ""}
    //       tagName="span"
    //       onChange={(e) => {
    //         this.setState({
    //           xpos_n: e.target.value
    //         })
    //       }}
    //       onFocus={() => {
    //         this.contentEditable.current.contentEditable = true
    //       }}
    //       onBlur={() => {
    //         this.contentEditable.current.contentEditable = false
    //         if (this.state.xpos_n !== null) {
    //           this.props.api_actions.data_word_edit({
    //             key: row.key,
    //             [xpos]: Number(this.state.xpos_n)
    //           })
    //         }
    //       }}
    //     />
    //     ---
    //   </div>
    // )
    /*
     * Render:
     */
    return (
      <div className={"Pos ui-form-section"}>
        <div className={"posDiv noselect"}>
          <Tooltip
            title={
              <div className={"help"}>
                <p>To remove this section, or move up/down, edit "POS" list above!</p>
                <p>Add synonyms to beginning of list.</p>
                <p>They will be added only to the "OK/Good" list. If you must add "Bad" (negative) words, contact the developer.</p>
              </div>
            }
          >
            <b className="title">
              {pos_expand[pos] || pos}
              {/*{row.pos_sentiment[pos] < 40 ? <>&#128545;</> : <>&#128512;</>}&thinsp;*/}:
            </b>
            <Tip />
          </Tooltip>
        </div>
        <div className={"flexrow posDiv"}>
          {/*
           * Add/Delete words from POS
           */}
          <InputGroup value={this.state.addwords} word={row.key} pos={pos} api_actions={api_actions} />
        </div>

        {ListShorter.length > 0 && (
          <div className={"posDiv"}>
            <Hint className={"color-primary"}>Recommended:</Hint>
            <span className="posWords color-primary">{ListShorter}</span>
          </div>
        )}

        {ListOk.length > 0 && (
          <div className={"posDiv"}>
            {/*<sub>{<>&#128512;</>}: </sub>*/}
            <Hint className={"color-accent opacity50 noselect"}>OK/Good:</Hint>
            <div className="posWords">
              {ListOk}
              &nbsp;&nbsp;
              <span
                className="select30 color-light noselect"
                onClick={() => {
                  let list = [];
                  for (let item of ListOk) {
                    if (item.props.word) {
                      list.push(item.props.word);
                    }
                  }
                  this.setState(
                    {
                      addwords: list.slice(0, this.state.xpos_n || 30).join(", ") + ",",
                    },
                    () => {}
                  );
                }}
              >
                (copy top {Math.min(ListOk.length, this.state.xpos_n || 30)})
              </span>
            </div>
          </div>
        )}
        {ListBad.length > 0 && (
          <div className={"posDiv"}>
            {/*<sub>{<>&#128545;</>}: </sub>*/}
            <Hint className={"color-bad opacity50 noselect"}>Negative:</Hint>
            <div className="posWords">{ListBad}</div>
          </div>
        )}
        {ListProper.length > 0 && (
          <div className={"posDiv"}>
            {/*<sub>{<>&#127963;</>}: </sub>*/}
            <Hint className={"color-medium opacity75 noselect"}>Proper:</Hint>
            <div className="posWords">{ListProper}</div>
          </div>
        )}
        {ListUnknown.length > 0 && (
          <div className={"posDiv"}>
            {/*<sub>{<>&#10067;</>}: </sub>*/}
            <Hint className={"color-medium opacity75 noselect"}>Unknown sentiment:</Hint>
            <div className="posWords">{ListUnknown}</div>
          </div>
        )}
      </div>
    );
  }
}

export default Pos;
