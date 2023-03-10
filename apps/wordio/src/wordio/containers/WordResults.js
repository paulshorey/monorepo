import React from "react";
import Link from "next/link";
import FieldList from "./FieldList";
import Field from "./Field";
import Pos from "./Pos";
import { StyledResults } from "./WordResults.styled";
import { faEdit } from "@fortawesome/pro-solid-svg-icons/faEdit";
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";
import PosWord from "./PosWord";
import Search from "src/wordio/components/Search";
import Head from "next/head";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as ui_actions from "src/shared/redux/actions/ui";
import api_actions from "src/shared/redux/actions/api";
import * as io_actions from "src/shared/redux/actions/io";

const WordResults = function (props) {
  /*
   * Search
   */
  const SearchAndHeader = (
    <>
      <Head>
        <title>Thesaurus "{props.word_input}"</title>
      </Head>
      <Search
        {...props}
        className={"Search Word "}
        domains={false}
        title="Synonyms and info for..."
        placeholder="..."
        // cue={[
        //   <span key="1">
        //     The most accurate thesaurus API&nbsp;
        //     <span className="nowrap">
        //       for <>N</>atural <>L</>anguage <>P</>rocessing applications.
        //     </span>
        //     &nbsp;
        //     <span key="3" className="nowrap">
        //       <FA icon={faBolt} className="color-accent" /> Powers our{" "}
        //       <a href="https://besta.domains" target="_blank">
        //         domain name generator
        //       </a>
        //       .
        //     </span>
        //   </span>
        // ]}
      />
    </>
  );
  /*
   * Data
   */
  let { word_input, word_chunks, api_actions, ui } = props;
  let row = word_chunks[word_input];
  if (!row || (word_input && !word_chunks[word_input])) {
    if (ui.loading) {
      return (
        <>
          {SearchAndHeader}
          <StyledResults className="ViewWord content">
            <p className="loading">...</p>
          </StyledResults>
        </>
      );
    }
    return (
      <>
        {SearchAndHeader}
        <StyledResults className="ViewWord content">
          {/*Edit*/}
          <Link className={"editWordLink"} href={`/edit_word?str=${word_input}`}>
            <a>
              <FA icon={faEdit} className="faEdit" style={{ transform: "scale(0.85)" }} />
            </a>
          </Link>

          {/*Fields*/}
          <p>Word not found</p>
        </StyledResults>
      </>
    );
  }
  let domains = [...new Set((row.tlds || []).flat())];
  let best_of = (row.pos_short || {}).all || [];

  let weird_abbreviation = false;
  if (row.abbreviation) {
    let arr = row.abbreviation
      .split(",")
      .map((str) => str.trim())
      .filter((str) => !!str);
    for (let val of arr) {
      if (val.length > row.key.length) {
        weird_abbreviation = true;
      }
    }
  }

  return (
    <>
      {SearchAndHeader}
      <StyledResults className="ViewWord content">
        {/*Edit*/}
        <Link className={"editWordLink"} href={`/edit_word?str=${row.key}`}>
          <a>
            <FA icon={faEdit} className="faEdit" style={{ transform: "scale(0.85)" }} />
          </a>
        </Link>

        {/*Fields*/}
        <div className={"ui-form-section ui-form-fieldset-grid"}>
          {["str", "proper", "root", "singular", "plural", "abbreviation", "acronym", "conjunction", "ws_sentiment"]
            .filter((field) => row[field] || row[field] === 0)
            .map((field, pi) => (
              <Field field={field} row={row} key={row.key + pi} />
            ))}

          {/*
           * Best Of
           */}
          {!!(best_of && best_of.length) && (
            <div className="ui-form-fieldset">
              <span className="label">summary:</span>
              <span className="value">
                {best_of.map((w, i) => (
                  <PosWord api_actions={api_actions} key={w} word={w} />
                ))}
              </span>
            </div>
          )}

          {/*
           * Domain extensions
           */}
          {/*{!!(domains && domains.length) && (*/}
          {/*  <div className="ui-form-fieldset">*/}
          {/*    <span className="label">*/}
          {/*      TLDs:*/}
          {/*    </span>*/}
          {/*    <span className="value">*/}
          {/*      {domains.map((dom, i) => (*/}
          {/*        <DomExt key={dom + i} domext={dom} noLink={true} />*/}
          {/*      ))}*/}
          {/*    </span>*/}
          {/*  </div>*/}
          {/*)}*/}

          {/*
           * Aux
           */}
          {!!row.aux && (
            <div className="ui-form-fieldset">
              <span className="label">bound morpheme</span>
            </div>
          )}
          {/*
           * Name
           */}
          {!!row.name && (
            <div className="ui-form-fieldset">
              <span className="label">is a name</span>
            </div>
          )}
        </div>

        {/*
         * Lists
         */}
        <div className={"ui-form-section"}>
          {["list"].map((field, pi) => (
            <FieldList field={field} row={row} key={row.key + pi} />
          ))}
        </div>

        {/*
         * Lists
         */}
        <div className={"ui-form-section"}>
          {[row.pos1, row.pos2, row.pos3, "bef", "aft", "ety", "etc"].map((pos, pi) => (
            <Pos api_actions={api_actions} pos={pos} row={row} key={pos + pi} expand={false} />
          ))}
        </div>
      </StyledResults>
    </>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    ui_actions: bindActionCreators(ui_actions, dispatch),
    api_actions: bindActionCreators(api_actions, dispatch),
    io_actions: bindActionCreators(io_actions, dispatch),
  };
};

const mapStateToProps = function (state) {
  return {
    ui: state.ui,
    word_input: state.input.str,
    word_chunks: state.output.chunks,
    search_now: state.input.search_now,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WordResults);
