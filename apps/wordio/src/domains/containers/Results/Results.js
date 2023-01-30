import React from "react";
import { ResultsStyled, ShowLinkStyled, ColorsStyled, _, __, ___, H5Styled } from "./Results.styled";
import Link from "next/link";
import Head from "next/head";
import Tlds from "./Tlds";
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";
import Search from "src/shared/components/Search";
import { faCaretDown } from "@fortawesome/pro-solid-svg-icons/faCaretDown";
import { faTimes } from "@fortawesome/pro-regular-svg-icons/faTimes";
import { faCode } from "@fortawesome/pro-regular-svg-icons/faCode";
import WordPoss from "src/domains/components/WordPoss";
import OptionsMore from "./WIP";
import Doms from "src/domains/components/Doms";
import IconFrown from "src/domains/components/IconFrown";
import { Modal } from "antd";
import PremiumDoms from "../../components/PremiumDoms";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as rx_ui_actions from "src/shared/redux/actions/ui";
import * as rx_io_actions from "src/shared/redux/actions/io";
import * as contact_actions from "src/shared/redux/actions/api/x_contact";

class Results extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tldAdd: "",
      showWip: false,
      showOptions: false,
      lastRequestTime: 0,
      showWhoisModal: false,
    };
  }

  async componentDidUpdate(prevProps) {
    /*
     * Get suggestions
     */
    if (this.props.search_now && this.props.search_now !== prevProps.search_now) {
      this.props.rx_io_actions.RX__search_suggestions();
    }
  }

  toggle_view_option = (key, force) => {
    this.props.rx_ui_actions.RX__toggle_key(key, force);
  };
  toggle_suggestions_option = (key, force) => {
    this.props.rx_io_actions.RX__toggle_suggestions_option(key, force);
  };
  toggleWip = () => {
    this.setState({
      showWip: !this.state.showWip,
    });
  };
  toggleOptions = () => {
    // let showWip = this.state.showOptions ? false : this.state.showWip
    // temporarily, always show WIP when showing options...
    let showWip = !this.state.showOptions;
    // show options
    this.setState({
      // toggle options UI
      showOptions: !this.state.showOptions,
      // if options UI is toggled OFF, then also hide the WIP UI
      showWip: showWip,
    });
  };
  tld_user = (tld) => {
    this.props.rx_io_actions.RX__tld_add(tld, "user");
  };
  tld_check = (tld) => {
    this.props.rx_io_actions.RX__tld_add(tld, "checked");
  };
  tld_uncheck = (tld) => {
    this.props.rx_io_actions.RX__tld_add(tld, "unchecked");
  };

  render() {
    /*
     * View variables:
     */
    // for results:
    let {
      ui,
      domain_availability,
      input_str,
      input_tld,
      input_spellchecked,
      input_is_name,
      input_is_brand,
      domain_suggested,
      domains_generic,
      domains_info,
      tlds_checked,
      input_words_arr,
      domains_sedo,
      domains_afternic,
    } = this.props;
    tlds_checked = Object.keys(tlds_checked);
    input_str = input_str.toLowerCase();
    let cue = [];
    let OriginalMessage = null;
    let original_domain = input_str.replace(/ /g, "") + "." + input_tld;
    let original_code = domain_availability[original_domain] || 0;
    let original_info = domains_info[original_domain];
    let original_expiry = (original_info && original_info.expiry) || "";
    let original_whois = (original_info && original_info.whois) || "";
    /*
     * message about availability
     */
    if (original_code === 0) {
      // OriginalMessage = <span key="avai">Checking availability...</span>;
    } else if (original_code === 8) {
      cue.push(
        <span key="avai">
          We own "<_ />
          <b>{original_domain}</b>
          <_ />
          ".
        </span>
      );
    } else if (original_code < 2) {
      OriginalMessage = (
        <span key="avai">
          {!original_expiry && (
            <>
              <IconFrown />
              <_ />
            </>
          )}
          <a href={"http://" + original_domain.replace(/ /g, "")} target="_blank">
            {original_domain}
          </a>
          <_ /> is not available
          {/* {!!original_expiry && ( */}
          <>
            ,{" "}
            <i>
              expires on <b style={{ fontSize: "80%", fontWeight: "700" }}>{original_expiry.replace(/-/g, "/")}</b>
            </i>{" "}
            (
            <span
              className="link"
              onClick={() => {
                this.setState({ showWhoisModal: true });
              }}
            >
              view WHOIS
            </span>
            )
          </>
          {/* )} */}
        </span>
      );
    } else if (original_code > 10) {
      OriginalMessage = (
        <span key="avai">
          <span>
            <_ />
            <span
              className="link clickable"
              onClick={() => {
                let form = window.document.getElementById("Domain101Form");
                let input = window.document.getElementById("Domain101Input");
                if (form && input) {
                  input.value = original_domain.replace(/ /g, "");
                  form.submit();
                }
              }}
            >
              <a href={"http://" + original_domain} target="_blank" className="color-attention">
                {original_domain}
              </a>
              <_ /> is on sale
            </span>{" "}
            for{" "}
            <span
              className="link clickable"
              onClick={() => {
                alert("This feature coming soon!");
              }}
            >
              ${Math.round(original_code).toLocaleString()}
            </span>
          </span>{" "}
          {/*<span className="hide-small">*/}
          {/*  <FA icon={faArrowLeft} className="x70" /> <span className="link clickable" onClick={()=>{alert('This feature coming soon!')}}>Visit the marketplace.</span> Try to negotiate.*/}
          {/*</span>*/}
        </span>
      );
    } else if (original_code > 100000000) {
      OriginalMessage = (
        <span key="avai">
          <span>
            "<_ />
            <a href={"http://" + original_domain} target="_blank">
              {original_domain}
            </a>
            <_ />" will expire soon
          </span>
          , on <b>{(new Date(original_code * 1000) + "").substring(4, 15)}</b>
        </span>
      );
    } else if (original_code === 3 || original_code === 5) {
      OriginalMessage = (
        <span key="avai">
          <span>
            <span>
              <a href={"http://" + original_domain} target="_blank">
                {original_domain}
              </a>{" "}
              is premium,{" "}
            </span>
            sold by the registry
            <span className="hide-small">
              {" "}
              (
              <span
                className="link"
                onClick={() => {
                  window.open101Domain(original_domain);
                }}
              >
                check the price
              </span>
              )
            </span>{" "}
          </span>
        </span>
      );
    } else if (original_code === 4) {
      OriginalMessage = (
        <span key="avai">
          <span>
            <span>
              <a href={"http://" + original_domain} target="_blank">
                {original_domain}
              </a>{" "}
              is for sale{" "}
            </span>
            in an aftermarket like{" "}
            <a href={"https://sedo.com/search/?campaignId=326988&keyword=" + original_domain} target="_blank">
              Sedo.com
            </a>
            &thinsp;/&thinsp;
            <a href={"https://www.afternic.com/search?k=" + original_domain} target="_blank">
              Afternic
            </a>
            &thinsp;/&thinsp;
            <a href={"https://dan.com/search?&terms=" + original_domain} target="_blank">
              Dan.com
            </a>
          </span>
        </span>
      );
    } else if (original_code >= 2) {
      OriginalMessage = (
        <span key="avai">
          <b style={{ margin: "0 0.1rem" }}>
            <span
              className="link"
              onClick={() => {
                window.open101Domain(original_domain);
              }}
            >
              {original_domain}
            </span>
          </b>{" "}
          is available!
        </span>
      );
    }

    /*
     * message about spell check
     */
    if (input_spellchecked && input_spellchecked.replace(/ /g, "") !== input_str.replace(/ /g, "")) {
      cue.push(
        <div key="spellchecked" className="spellchecked">
          Also showing suggestions for "
          <b>
            {input_spellchecked.split(" ").map((str, si) => (
              <span key={si}>
                {str}
                <__ />
              </span>
            ))}
            .{input_tld}
          </b>
          ".
          {/*<br /> To avoid spell-checking any word or phrase, put it in "quotes".*/}
        </div>
      );
    } else if (input_is_name) {
      cue.push(
        <div key="spellchecked" className="spellchecked">
          <span className="link nowrap" onClick={this.props.rx_ui_actions.open_contact_form}>
            Did you mention a person's name?
          </span>{" "}
          We're still improving handling of non-dictionary words.
        </div>
      );
    } else if (input_is_brand) {
      cue.push(
        <div key="spellchecked" className="spellchecked">
          <span className="link nowrap" onClick={this.props.rx_ui_actions.open_contact_form}>
            Did you mention a brand name?
          </span>{" "}
          We're still improving results for non-dictionary words.
        </div>
      );
    }

    // else if (input_is_tech) {
    //   cue.push(
    //     <div key="spellchecked" className="spellchecked">
    //       <span className="link nowrap" onClick={this.props.rx_ui_actions.open_contact_form}>
    //         Did you mean to type in a technology term?
    //       </span>{" "}
    //       We're working on auto-categorizing user input.
    //     </div>
    //   )
    // }
    // else if ((input_str.length > 12 && !input_str.includes(" ")) || this.props.input_str_possibly_corrupted) {
    //   cue.push(
    //     <div key="spellchecked" className="spellchecked">
    //       Did we parse the text correctly? Try putting spaces between words.
    //     </div>
    //   )
    // }
    /*
     * show message
     */
    let cue_nav = (
      <ShowLinkStyled className="showThesaurus hide-small">
        <span
          className="link"
          onClick={() => {
            this.props.rx_ui_actions.RX__toggle_key("show_poss");
          }}
        >
          {!!this.props.ui.show_poss ? (
            <>
              <FA icon={faTimes} className="toggleNLPThesaurus faTimes color-accent x145" />
              &nbsp;Hide thesaurus
            </>
          ) : (
            <>
              Thesaurus&thinsp;
              <FA icon={faCaretDown} className="toggleNLPThesaurus faCaret color-accent" />
            </>
          )}
        </span>
        &thinsp;&thinsp;&thinsp;
        <span
          className="link"
          onClick={() => {
            this.props.rx_ui_actions.RX__toggle_key("show_wip");
          }}
        >
          {!!this.props.ui.show_wip ? (
            <>
              <FA icon={faTimes} className="toggleNLPThesaurus faTimes color-accent x145" />
              &nbsp;Hide phrases
            </>
          ) : (
            <>
              Phrases&thinsp;
              <FA icon={faCaretDown} className="faCaret color-accent" />
            </>
          )}
        </span>
      </ShowLinkStyled>
    );

    return (
      <ResultsStyled>
        <Head>
          <title>Domain suggestions</title>
        </Head>
        <Search
          className={"Search Domains Results"}
          placeholder={"enter two or three words"}
          domains={true}
          home={true}
          title_nav={
            <span className="hide-small">
              <a target="_blank" href="https://documenter.getpostman.com/view/23360867/2s8YzXtewC">
                <span>use our API &thinsp;</span>
                <FA icon={faCode} className="x115" />
                <___ />
              </a>
            </span>
          }
          cue={cue}
          cue_nav={cue_nav}
        />

        {/*
         * POSS content, below Search form
         */}
        {!!this.props.ui.show_poss && <WordPoss {...this.props} />}

        {/*
         * Results
         */}
        <div className="container">
          {/*
           * PremiumDoms
           */}
          {((!!domains_sedo && (domains_sedo.coms || domains_sedo.alts)) || (!!domains_afternic && (domains_afternic.coms || domains_afternic.alts))) && (
            <div className="results">
              <H5Styled className={"heading"} style={{ margin: "1.25rem 1.7rem 0.75rem" }}>
                Premium deals:
              </H5Styled>
              <PremiumDoms from="sedo" str={input_str} tld={input_tld} domains={domains_sedo} />
              <PremiumDoms from="afternic" str={input_str} tld={input_tld} domains={domains_afternic} />
            </div>
          )}
          {/*
           * Options opened
           */}
          <OptionsMore that={this} />
          {/*
           * Suggestions + TLDs + WIP
           */}
          <ColorsStyled className={"content results " + (!this.state.gotAvailability ? " gettingAvailability" : " gotAvailability")}>
            {/*
             * Suggestions
             */}
            <div className="flex">
              <Doms
                OriginalMessage={OriginalMessage}
                domains_generic={domains_generic}
                domain_suggested={domain_suggested}
                domain_availability={domain_availability}
                ui={ui}
                input_str={input_str}
                input_tld={input_tld}
                input_spellchecked={input_spellchecked}
                tlds_checked={tlds_checked}
                input_words_arr={input_words_arr}
              />
              <Tlds that={this} />
            </div>
          </ColorsStyled>
        </div>

        {/*
         * WHOIS
         */}
        <Modal
          visible={this.state.showWhoisModal}
          onOk={() => {
            this.setState({ showWhoisModal: false });
          }}
          onCancel={() => {
            this.setState({ showWhoisModal: false });
          }}
        >
          <pre>{original_whois}</pre>
          <hr />
          <p>
            <b>No content?</b>
          </p>
          <p>
            Open{" "}
            <a target="_blank" href={`https://whois.com/whois/${input_str}.${input_tld}`}>
              whois.com/whois/{input_str}.{input_tld}
            </a>
          </p>
        </Modal>
      </ResultsStyled>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    rx_ui_actions: bindActionCreators(rx_ui_actions, dispatch),
    rx_io_actions: bindActionCreators(rx_io_actions, dispatch),
    contact_actions: bindActionCreators(contact_actions, dispatch),
  };
};

const mapStateToProps = function (state) {
  return {
    // word
    word_chunks: state.output.chunks,
    word_input: state.input.input,
    input_str: state.input.str,
    input_spellchecked: state.input.spellchecked,
    input_tld: state.input.tld || "com",
    search_now: state.input.search_now,
    input_words_arr: state.input.words_arr,
    // ui
    ui: state.ui,
    // suggestions_options
    suggestions_options: state.input.suggestions_options,
    // meta
    input_is_name: state.output.is_name,
    input_is_brand: state.output.is_brand,
    input_is_tech: state.output.is_tech,
    // tlds
    domains_sedo: state.output.domains_sedo,
    domains_afternic: state.output.domains_afternic,
    tlds_all: state.output.tlds_all,
    tlds_user: state.output.tlds_user,
    tlds_checked: state.output.tlds_checked,
    tlds_unchecked: state.output.tlds_unchecked,
    tlds_extra: state.output.tlds_extra,
    // suggestions
    domains_info: state.output.domains_info,
    domains_generic: state.output.domains_generic,
    domain_suggested: state.output.domain_suggested,
    domain_availability: state.output.domain_availability,
    com_hacks: state.output.com_hacks,
    word_hacks: state.output.word_hacks,
    phrase_hacks: state.output.phrase_hacks,
    suggestions_phrase_lists: state.output.suggestions_phrase_lists,
    str_possibly_corrupted: state.output.str_possibly_corrupted,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Results);
