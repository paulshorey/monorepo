import React, { useState } from "react";
import { OptionsStyled } from "./Options.styled";
import { Switch } from "antd";
import IconFrown from "src/shared/components/IconFrown";
// import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome"
// import { faAngleUp } from "@fortawesome/pro-regular-svg-icons"
// import { faSort } from "@fortawesome/pro-solid-svg-icons"
// import { H5Styled, ShowLinkStyled } from "./Domains.styled"
// import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome"
// import { faCaretDown, faCaretUp } from "@fortawesome/pro-solid-svg-icons"

const Options = function (props) {
  const [isHidden, toggle_isHidden] = useState(false);
  /*
   * User "container" state/props/methods!
   * This "child" component is to simplify container's render() logic.
   */
  let that = props.that;
  // let { word_hacks, phrase_hacks } = that.props
  /*
   * View
   */
  return (
    <OptionsStyled className={isHidden ? " isHidden " : ""}>
      <span
        className="x"
        onClick={() => {
          if (!isHidden) {
            toggle_isHidden(true);
            if (window.innerWidth < 700) {
              window.scrollTo(0, 161);
            } else {
              window.scrollTo(0, 173);
            }
            let but = window.document.querySelector(".eapps-form-floating-button");
            if (but) {
              but.style.display = "none";
            }
          } else {
            toggle_isHidden(false);
            window.scrollTo(0, 0);
            let but = window.document.querySelector(".eapps-form-floating-button");
            if (but) {
              but.style.display = "flex";
            }
          }
        }}
      >
        &nbsp;
      </span>
      {/*
       * LABEL    style={{ color: "#1890ff", textShadow: "1px 0px 1px rgba(0,0,0,0.01)" }}
       */}
      {/*<H5Styled className="doms_title attention options">Showing</H5Styled>*/}

      {/*
       * TOGGLE VIEW
       */}
      <div className="option">
        <span
          onClick={() => {
            that.toggle_view_option("show_one_list");
          }}
        >
          <Switch className="Switch" size="small" checked={!!that.props.ui.show_one_list} />
          <span className="color-link">all in one list</span>
        </span>
      </div>

      <div className="option">
        <span
          onClick={() => {
            that.toggle_view_option("show_unavailable");
          }}
        >
          <Switch className="Switch" size="small" checked={!!that.props.ui.show_unavailable} />
          <span>
            <IconFrown className="hide-small" />
            <span> unavailable</span>
          </span>
          {/* &amp; aftermarket*/}
        </span>
      </div>

      <div className="option">
        <span
          onClick={() => {
            that.props.io_actions.RX__search_suggestions({ use_dashes: !that.props.suggestions_options.use_dashes });
          }}
        >
          <Switch className="Switch" size="small" checked={!!that.props.suggestions_options.use_dashes} />
          <span className="hide-small">allow </span>
          <span> dashes</span>
        </span>
      </div>

      <div className="option">
        <span
          onClick={() => {
            that.props.io_actions.RX__search_suggestions({
              use_word_hacks: !that.props.suggestions_options.use_word_hacks
            });
          }}
        >
          <Switch className="Switch" size="small" checked={!!that.props.suggestions_options.use_word_hacks} />
          <span className="hide-small">use </span>
          <span> word hacks</span>
        </span>
      </div>

      <div className="option">
        <span
          onClick={() => {
            that.props.io_actions.RX__search_suggestions({
              use_phrase_hacks: !that.props.suggestions_options.use_phrase_hacks
            });
          }}
        >
          <Switch className="Switch" size="small" checked={!!that.props.suggestions_options.use_phrase_hacks} />
          <span className="hide-small">use </span>
          <span> phrase hacks</span>
        </span>
      </div>

      <div className="option">
        <span
          onClick={() => {
            that.toggle_view_option("show_premium_registry");
          }}
          style={{ color: "var(--color-accent-dark)" }}
        >
          <Switch className="Switch" size="small" checked={!!that.props.ui.show_premium_registry} />
          <span>$ registry premium</span>
        </span>
      </div>
      <div className="option">
        <span
          onClick={() => {
            that.toggle_view_option("show_premium_aftermarket");
          }}
          style={{ color: "var(--color-accent-dark)" }}
        >
          <Switch className="Switch" size="small" checked={!!that.props.ui.show_premium_aftermarket} />
          <span>$$ aftermarket&nbsp;</span>
        </span>
      </div>

      {/*
       * MORE OPTIONS
       */}
      {/*{!!that.props.ui.show_more_options ? (*/}
      {/*  <div className="aftermarket">*/}
      {/*    <div className="option">*/}
      {/*      <span*/}
      {/*        onClick={() => {*/}
      {/*          that.toggle_view_option("show_premium_registry")*/}
      {/*        }}*/}
      {/*        style={{ color: "var(--color-accent)" }}*/}
      {/*      >*/}
      {/*        <Switch className="Switch" size="small" checked={!!that.props.ui.show_premium_registry} />*/}
      {/*        <span>>$1000</span>*/}
      {/*      </span>*/}
      {/*    </div>*/}
      {/*    <div className="option">*/}
      {/*      <span*/}
      {/*        onClick={() => {*/}
      {/*          that.toggle_view_option("show_premium_aftermarket")*/}
      {/*        }}*/}
      {/*        style={{ color: "var(--color-accent)" }}*/}
      {/*      >*/}
      {/*        <Switch className="Switch" size="small" checked={!!that.props.ui.show_premium_aftermarket} />*/}
      {/*        <span>>$10000</span>*/}
      {/*      </span>*/}
      {/*    </div>*/}
      {/*    <div className="option">*/}
      {/*      <span*/}
      {/*        onClick={() => {*/}
      {/*          that.toggle_view_option("show_premium_unknown")*/}
      {/*        }}*/}
      {/*        style={{ color: "var(--color-accent)" }}*/}
      {/*      >*/}
      {/*        <Switch className="Switch" size="small" checked={!!that.props.ui.show_premium_unknown} />*/}
      {/*        <span>$unknown</span>*/}
      {/*      </span>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*) : (*/}
      {/*  <div*/}
      {/*    className="toggle-more-options clickable"*/}
      {/*    onClick={() => {*/}
      {/*      that.props.ui_actions.RX__toggle_key("show_more_options")*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    <span className="">more &nbsp;</span>*/}
      {/*    <FA icon={faCaretDown} />*/}
      {/*  </div>*/}
      {/*)}*/}
    </OptionsStyled>
  );
};

export default Options;
