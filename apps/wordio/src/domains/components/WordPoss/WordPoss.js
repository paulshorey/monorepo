import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { WordPossStyled } from "./WordPoss.styled";
import PosWord from "src/wordio/components/EditWord/PosWord";
import api_actions from "src/shared/redux/actions/api";
import InputGroup from "../../../wordio/components/EditWord/InputGroup";
import pos_expand from "src/shared/data/words/function/pos_expand";
import { faPen } from "@fortawesome/pro-solid-svg-icons/faPen";
import { faBook } from "@fortawesome/pro-solid-svg-icons/faBook";
import { faExternalLinkSquareAlt } from "@fortawesome/pro-solid-svg-icons/faExternalLinkSquareAlt";

import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";

class WordPoss extends React.Component {
  render() {
    let { word_chunks, show_poss, api_actions, input_tld } = this.props;
    // console.log("WordPoss show_poss", show_poss)
    // console.log("WordPoss props", this.props)
    let chunks_list = Object.values(word_chunks);
    if (!chunks_list.length) {
      return (
        <WordPossStyled className={"WordPossStyled hide-small " + (show_poss ? " show" : " hide")}>
          <div className="content">
            <p>Loading mini thesaurus...</p>
            <p>
              Please visit{" "}
              <a target="_blank" href="https://wordio.co?str=hello">
                Wordio.co
              </a>{" "}
              for the full experience
            </p>
          </div>
        </WordPossStyled>
      );
    }
    /*
     * Filter
     */
    chunks_list = chunks_list.filter((row) => {
      if (
        !row ||
        !row.poss ||
        ((!row.poss[row.pos1] || !row.poss[row.pos1].length) &&
          (!row.tlds[0] || !row.tlds[0].length) &&
          (!row.tlds[1] || !row.tlds[1].length) &&
          (!row.tlds[2] || !row.tlds[2].length))
      ) {
        return false;
      }
      return true;
    });
    /*
     * Render:
     */
    return (
      <WordPossStyled className={"WordPossStyled hide-small " + (show_poss ? " show" : " hide")}>
        <section className={"columns"}>
          {chunks_list.length ? (
            chunks_list.map((row, ri) => {
              let poss_dict = row.poss;
              let poss_list = [...new Set([row.pos1, row.pos2, row.pos3, ...Object.keys(poss_dict)])];

              return (
                <div key={row.key + ri} className="column">
                  {/*
                   * word key:
                   */}
                  <div>
                    &quot;
                    <b>
                      <a target="_blank" href={"/edit_word?str=" + row.key}>
                        {row.str}&nbsp;
                        <FA icon={faPen} style={{ transform: "scale(0.85)" }} />
                      </a>
                    </b>
                    &quot; ({row.list_count}) {/* name */}
                    {row.name && <span className="color-dark nn">(is name) </span>}
                    {/* aux */}
                    {row.aux && <span className="color-dark nn">(bound) </span>}
                    {/* root */}
                    {row.root && row.root !== row.str && (
                      <span key={row.root}>
                        <span className="color-dark nn"> root: </span>'
                        <a target="_blank" href={"/edit_word?str=" + row.root}>
                          {row.root}
                        </a>
                        '
                      </span>
                    )}
                    {/* singular */}
                    {row.singular && row.singular !== row.key && (
                      <span key={row.singular}>
                        <span className="color-dark nn"> singular: </span>'
                        <a target="_blank" href={"/edit_word?str=" + row.singular}>
                          {row.singular}
                        </a>
                        '
                      </span>
                    )}
                    {/* plural */}
                    {row.plural && row.plural !== row.key && (
                      <span key={row.plural}>
                        <span className="color-dark nn"> plural: </span>'
                        <a target="_blank" href={"/edit_word?str=" + row.plural}>
                          {row.plural}
                        </a>
                        '
                      </span>
                    )}
                    {/* abbreviation */}
                    {row.abbreviation &&
                      row.abbreviation.split(",").map((w) => {
                        w = w.trim();
                        if (w !== row.key) {
                          return (
                            <span key={w}>
                              <span className="color-dark nn"> abbreviation: </span>'
                              <a target="_blank" href={"/edit_word?str=" + w}>
                                {w}
                              </a>
                              '
                            </span>
                          );
                        }
                      })}
                    {/* acronym */}
                    {row.acronym && row.acronym !== row.key && (
                      <span key={row.acronym}>
                        <span className="color-dark nn"> acronym: </span>
                        &nbsp;
                        <a target="_blank" href={"/edit_word?str=" + row.acronym}>
                          {row.acronym}
                        </a>
                        &nbsp;&nbsp;
                      </span>
                    )}
                  </div>
                  {/*
                   * word pos:
                   */}
                  <div className="">
                    {poss_list.map((pos, pi) => {
                      if (poss_dict[pos] && poss_dict[pos].length) {
                        return (
                          <section key={pi + pos} className={"columns"}>
                            <div className="column">
                              {/*
                               * pos key:
                               */}
                              <h5 className="color-dark nn">{pos_expand(pos)}:</h5>
                              {/*
                               * add synonyms to pos:
                               */}
                              <InputGroup
                                className="pos_inputgroup"
                                word={row.key}
                                pos={pos}
                                api_actions={api_actions}
                              />
                              {/*
                               * view/edit pos:
                               */}
                              <div className="words">
                                {poss_dict[pos].map((w, wi) =>
                                  !pos.includes("domains") ? (
                                    <span key={w + wi}>
                                      <PosWord row={row} word={w} info={undefined} api_actions={api_actions} />
                                    </span>
                                  ) : (
                                    <span key={w}>
                                      <a target="_blank" href={"/edit_domain?tld=" + w}>
                                        {w}
                                      </a>
                                      ,
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          </section>
                        );
                      } else if (pi === 0) {
                        return (
                          <div className="">
                            <section className={"columns"}>
                              <div className="column">
                                <h5 className="color-dark nn">{pos_expand(row.pos1)}:</h5>
                              </div>
                            </section>
                          </div>
                        );
                      }
                    })}

                    {/*
                     * tlds
                     */}
                    <section className={"columns"}>
                      <div className="column">
                        {/*
                         * pos key:
                         */}
                        <h5 className="color-dark nn">tlds:</h5>
                        {/*
                         * view/edit pos:
                         */}
                        <div className="words">
                          {row.tlds.map((list, li) => (
                            <div key={li}>
                              list #{li}:{" "}
                              {list.map((word, wi) => (
                                <span key={wi}>
                                  <a
                                    className="color-link"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      window.open(`/edit_domain?tld=${word}`);
                                    }}
                                  >
                                    {word}
                                  </a>
                                  ,{" "}
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  </div>
                  <div>
                    <br />
                    <FA icon={faBook} style={{ transform: "scale(0.85)" }} />
                    See full entry in&nbsp;
                    <span
                      className="color-link clickable nowrap"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(`https://wordio.co/word?str=${row.key}`);
                      }}
                    >
                      wordio.co <FA icon={faExternalLinkSquareAlt} style={{ transform: "scale(0.85)" }} />
                    </span>
                    {/*&nbsp;*/}
                    {/*<span*/}
                    {/*  className="color-link clickable"*/}
                    {/*  onClick={(e) => {*/}
                    {/*    e.preventDefault()*/}
                    {/*    window.open(`/edit_word?str=${row.key}`)*/}
                    {/*  }}*/}
                    {/*>*/}
                    {/*  <FA icon={faPen} style={{ transform: "scale(0.85)" }} />*/}
                    {/*  edit*/}
                    {/*</span>{" "}*/}
                    {/*&nbsp;*/}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="content">
              No related synonyms or tlds found. <b> Was your search a brand or name? </b> Please{" "}
              <a href="/contact" target="_blank">
                let us know
              </a>
              . Thanks!
            </p>
          )}
        </section>
      </WordPossStyled>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    api_actions: bindActionCreators(api_actions, dispatch)
  };
};

const mapStateToProps = function (state) {
  return {
    show_poss: state.ui.show_poss,
    word_chunks: state.output.chunks,
    input_tld: state.input.tld
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WordPoss);
