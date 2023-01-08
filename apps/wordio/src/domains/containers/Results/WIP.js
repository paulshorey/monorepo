import React from "react";
import { WIPStyled } from "./WIP.styled";

const WIPToggle = function (props) {
  /*
   * User "container" state/props/methods!
   * This "child" component is to simplify container's render() logic.
   */
  let that = props.that;
  let { ui, suggestions_phrase_lists, word_hacks, phrase_hacks, com_hacks } = that.props;
  /*
   * View
   */
  if (!ui.show_wip) {
    return null;
  }
  return (
    <WIPStyled>
      <div className="content">
        {/*
         * WIP
         */}
        <div className="options-wip">
          <div className="options-title">
            <b>This is the process that we used to create the suggestions:</b> (scroll right) <br />
          </div>
          <div className="columns">
            {/*
             * WIP PHRASE LISTS (debugging, temporary)
             */}
            {Object.keys(suggestions_phrase_lists || {}).map((title, i) => {
              let lists = suggestions_phrase_lists[title];
              if (!lists || !lists.length) return null;
              return (
                <div key={title + i} className="column nowrap">
                  <div className="nowrap">
                    <b>{title}</b>
                  </div>
                  <div>
                    {lists.map((phrase, pi) => (
                      <div key={pi}>&quot;{phrase.join(" ")}&quot;</div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/*
             * WIP HACKS
             */}
            <div className="column">
              <div className="nowrap">
                <b>word hacks</b>
              </div>
              <div className="columns">
                {!!word_hacks && !!word_hacks.length && (
                  <div className="column pre nowrap">
                    {word_hacks.map((phrase, pi) => (
                      <div key={pi}>&quot;{phrase}&quot;</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="column">
              <div className="nowrap">
                <b>phrase hacks</b>
              </div>
              <div className="columns">
                {!!phrase_hacks && !!phrase_hacks.length && (
                  <div className="column pre nowrap">
                    {phrase_hacks.map((phrase, pi) => (
                      <div key={pi}>&quot;{phrase}&quot;</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </WIPStyled>
  );
};

export default WIPToggle;
