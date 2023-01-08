import React from "react";
import { TldsStyled } from "./Tlds.styled";
import { H5Styled } from "src/domains/containers/Results/Results.styled";
import Options from "./Options";
// import OptionsToggle from "./OptionsToggle"

const DomainsResults = function (props) {
  /*
   * User "container" state/props/methods!
   * This "child" component is to simplify container's render() logic.
   */
  let that = props.that;
  /*
   * Same as this.render():
   */
  let { tlds_user = {}, tlds_checked = {}, tlds_extra = {} } = that.props;
  let tlds_user_arr = Object.keys(tlds_user);
  let tlds_checked_arr = Object.keys(tlds_checked);
  let tlds_extra_arr = Object.values(tlds_extra);

  return (
    <TldsStyled className="TldsStyled">
      {/*
       * Options (when collapsed)
       */}
      <Options key="options" that={that} />

      {/*
       *
       * TOGGLE OPTIONS (to show/hide 2nd content area, below)
       *
       */}
      {/*<OptionsToggle that={that} />*/}

      {/*
       *
       * RESULTS
       *
       */}
      {!!(tlds_checked_arr && tlds_checked_arr.length) && (
        <div className="section">
          <div className={"heading"}>
            <H5Styled className="checked hide-small">TLD suggestions:</H5Styled>
            <H5Styled className="checked show-small">TLDs:</H5Styled>
          </div>

          {/*
           * Suggestions + User's choice
           */}
          {[...tlds_user_arr, ...tlds_checked_arr, ...tlds_extra_arr].map((tld, i) => (
            <div key={tld + "ch" + i} className={"tld_line checked"}>
              <span className="tld">
                <b>{tld ? "." : <>&nbsp;</>}</b>
                {tld}
              </span>
              {/*{!(i === 0 && obj_is_empty(tlds_user_arr)) && (*/}
              {/*  <FA*/}
              {/*    icon={faTimes}*/}
              {/*    className="fa-times"*/}
              {/*    onClick={() => {*/}
              {/*      that.tld_uncheck(tld)*/}
              {/*    }}*/}
              {/*  />*/}
              {/*)}*/}
            </div>
          ))}

          {/*
           * Unused
           */}
          {/*{tlds_extra && tlds_extra.map && (*/}
          {/*  <div className="section">*/}
          {/*    <div className={"heading"}>*/}
          {/*      <H5Styled className="unchecked">*/}
          {/*        <span>Other</span>*/}
          {/*        <span className="show-small">s:</span>*/}
          {/*        <span className="hide-small">&nbsp;suggestions:&nbsp;</span>*/}
          {/*      </H5Styled>*/}
          {/*      <div className="info">*/}
          {/*        learn more &thinsp;*/}
          {/*        <FA icon={faInfo} />*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*    {tlds_extra.map((tld, i) => (*/}
          {/*      <div key={tld + "ch" + i} className={"tld_line unchecked"}>*/}
          {/*        <span className="tld">*/}
          {/*          <b>.</b>*/}
          {/*          {tld}*/}
          {/*        </span>*/}
          {/*      </div>*/}
          {/*    ))}*/}
          {/*  </div>*/}
          {/*)}*/}
        </div>
      )}
    </TldsStyled>
  );
};

export default DomainsResults;
