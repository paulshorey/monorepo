import React from "react";
import Hint from "src/admin/components/Hint";
import PosWord from "./PosWord";
import pos_expand from "src/shared/data/words/function/pos_expand";

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      advanced: props.expand || false,
    };
  }

  render() {
    let { pos, row, api_actions } = this.props;
    /*
     * validate
     */
    if (!pos) {
      return null;
    }
    /*
     * slice of row.synonyms,
     * with before/after
     */
    let sdict_n = 0;
    let sdict = {};
    for (let syn of row.synonyms) {
      let word = syn[0];
      if (pos === syn[4]) {
        /*
         * Create tuple of 3 numbers:
         * [ 0-1 (sentiment bad - ok), 0-1 (lowercase - proper), 0-1 (sentiment known - unknown) ]
         */
        sdict[word] = syn.slice(1, 4);
        sdict_n++;
      }
    }
    if (!sdict_n) {
      return null;
    }
    let slist = Object.entries(sdict);
    let ListOk = slist
      .map((tuple) => {
        let [word, info] = tuple;
        if (info[0] === 1 && info[1] === 0) {
          return <PosWord api_actions={api_actions} key={word} word={word} />;
        }
      })
      .filter((val) => !!val);
    let ListBad = slist
      .map((tuple) => {
        let [word, info] = tuple;
        if (info[0] === 0 && info[1] === 0) {
          return <PosWord api_actions={api_actions} key={word} word={word} />;
        }
      })
      .filter((val) => !!val);
    let ListProper = slist
      .map((tuple) => {
        let [word, info] = tuple;
        if (info[1] === 1) {
          return <PosWord api_actions={api_actions} key={word} word={word} />;
        }
      })
      .filter((val) => !!val);
    let ListUnknown = slist
      .map((tuple) => {
        let [word, info] = tuple;
        if (info[2] === 1) {
          return <PosWord api_actions={api_actions} key={word} word={word} />;
        }
      })
      .filter((val) => !!val);

    /*
     *
     * Render:
     *
     */
    if (!ListOk.length && !ListBad.length && !ListProper.length && !ListUnknown.length) {
      return null;
    }
    return (
      <div className={"ui-form-section advanced"}>
        <p className={"one"}>
          <b className="title">{pos_expand(pos)}:</b>
        </p>

        <div className={"two"}>
          {/*{ListShorter.length > 0 && (*/}
          {/*  <p>*/}
          {/*    /!*<sub>{<>&#128512;</>}: </sub>*!/*/}
          {/*    <Hint className={"color-accent opacity50"}>Sorted by length:</Hint>*/}
          {/*    <span className="posWords opacity50">{ListShorter}</span>*/}
          {/*  </p>*/}
          {/*)}*/}
          {ListOk.length > 0 && (
            <p>
              {/*<sub>{<>&#128512;</>}: </sub>*/}
              <Hint className={"color-accent opacity50"}>Ok/Good:</Hint>
              <span className="posWords">{ListOk}</span>
            </p>
          )}
          {ListBad.length > 0 && (
            <p>
              {/*<sub>{<>&#128545;</>}: </sub>*/}
              <Hint className={"color-bad opacity50"}>Negative:</Hint>
              <span className="posWords">{ListBad}</span>
            </p>
          )}
          {ListProper.length > 0 && (
            <p>
              {/*<sub>{<>&#127963;</>}: </sub>*/}
              <Hint className={"color-light opacity75"}>Proper:</Hint>
              <span className="posWords">{ListProper}</span>
            </p>
          )}
          {ListUnknown.length > 0 && (
            <p>
              {/*<sub>{<>&#10067;</>}: </sub>*/}
              <Hint className={"color-light opacity75"}>Unknown sentiment:</Hint>
              <span className="posWords">{ListUnknown}</span>
            </p>
          )}
        </div>

        {/*<p*/}
        {/*  className={"three"}*/}
        {/*  onClick={() => {*/}
        {/*    this.setState({ advanced: false })*/}
        {/*  }}*/}
        {/*>*/}
        {/*  <FA icon={faAngleUp} className="faAngleUp" />*/}
        {/*</p>*/}
      </div>
    );
  }
}
