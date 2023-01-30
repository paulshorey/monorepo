import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as io_actions from "src/shared/redux/actions/io";
import * as ui_actions from "src/shared/redux/actions/ui";
import api_actions from "src/shared/redux/actions/api";
import { StyledPage, StyledSearch } from "src/shared/components/Layout/styles";
import Search from "src/shared/components/Search";
import EditDomainResults from "./Results";
import stopwords from "src/shared/data/words/stopwords";
import AllDomains from "./AllDomains";
import Link from "next/link";

class EditDomain extends React.Component {
  constructor(props) {
    console.error("EDIT DOMAIN REFRESHED");
    super(props);
    this.state = {
      gotten_tld: "",
      synsDict: {},
      dom: {},
      all_domains: [],
    };
  }
  submit_state_dom = async () => {
    let res = await this.props.api_actions.data_domain_edit(this.state.dom);
    if (res && res.data) {
      this.getData();
    }
  };
  getData = async () => {
    console.warn("EditDomain.js getData()");
    // get data
    let { input_tld } = this.props;
    if (input_tld) {
      // stopword
      let stopword = stopwords[input_tld];
      if (stopword) {
        // get data, but note that it is stopword, so UI can show warning
        this.setState({
          stopword: stopword ? input_tld : "",
        });
      }
      // prevent duplicate calls -
      // verify that it's not same tld as previous request
      // - then get data if unique
      if (input_tld && input_tld !== this.state.gotten_tld) {
        if (typeof window === "object") window.isLoading("getData");
        console.log("     ...getData()...", `input_tld="${input_tld}", gotten_tld="${this.state.gotten_tld}"`);
        // get data
        this.setState({ gotten_tld: input_tld }, async () => {
          // get row (tld, syns, syns1)
          let dom = await this.props.api_actions.data_domain_get(input_tld);
          if (dom && dom.key) {
            this.gotData(dom);
          }
          // get expanded list of %ILIKE% results
          let data = await this.props.api_actions.data_domain_syns_dict(input_tld);
          if (data) {
            this.gotDataDict(data);
          }
          // release hold - allow duplicate call
          this.setState({ gotten_tld: "" });
          // done loading
          if (typeof window === "object") window.doneLoading("getData");
        });
      }
    }
  };
  gotData = (dom) => {
    console.log("dom", dom);
    // dom is the DB row, from BE
    let syns = Array.isArray(dom.syns) ? dom.syns : [];
    let syns1 = Array.isArray(dom.syns1) ? dom.syns1 : [];
    // show new data
    this.setState({
      dom: {
        ...dom,
        // syns
        syns:
          syns
            .map((w) => w.trim())
            .filter((w) => !!w)
            .join(", ") + (syns.length ? ", " : ""),
        // convert syns to string
        syns1:
          syns1
            .map((w) => w.trim())
            .filter((w) => !!w)
            .join(", ") + (syns1.length ? ", " : ""),
      },
    });
    // scroll to top
    if (typeof window === "object") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };
  gotDataDict = (dom) => {
    // show new data
    this.setState({
      synsDict: dom,
    });
  };
  getAllDomains = async () => {
    let doms = await this.props.api_actions.data_domains_all();
    this.setState({
      all_domains: doms || [],
    });
  };

  componentDidMount() {
    /*
     * trigger update list of all domains from DB
     */
    this.getAllDomains();
    setTimeout(() => {
      this.getData();
    }, 500);
  }

  componentDidUpdate(prevProps) {
    /*
     * Get suggestions
     */
    if (this.props.search_now && this.props.search_now !== prevProps.search_now) {
      console.log("EditDomain.js action search_now");
      this.getData();
    }
    // /*
    //  * Get domain info
    //  */
    // if (this.props.input_tld && this.props.input_tld !== prevProps.input_tld) {
    //   console.log("EditDomain.js action input_tld")
    //   this.getData()
    // }
  }

  render() {
    let { input_tld } = this.props;
    let { dom } = this.state;

    /*
     * Verify content:
     */
    let PageContent = null;
    // no domain:
    if (!dom || !dom.key) {
      PageContent = (
        <div className="page content">
          &#9757; Choose a domain extension to edit.&nbsp;
          {/*
           * All Domains
           */}
          <AllDomains dom={dom} that={this} />
        </div>
      );
    }
    // verified OK:
    else {
      PageContent = (
        <div className="page content widewidth">
          <EditDomainResults that={this} />

          {/*
           * All Domains
           */}
          <AllDomains dom={dom} that={this} />
        </div>
      );
    }

    /*
     * Render content:
     */
    return (
      <>
        <StyledSearch>
          <Search
            {...this.props}
            domains={true}
            hideInput={true}
            // cue={[<span key="1">&#9757; Choose a domain extension to edit.&nbsp;</span>]}
          />
        </StyledSearch>

        <StyledPage>{PageContent}</StyledPage>
      </>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    io_actions: bindActionCreators(io_actions, dispatch),
    ui_actions: bindActionCreators(ui_actions, dispatch),
    api_actions: bindActionCreators(api_actions, dispatch),
  };
};

const mapStateToProps = function (state) {
  return {
    search_now: state.input.search_now,
    input_tld: state.input.tld,
    tlds_user: state.output.tlds_user,
    tlds_all: state.output.tlds_all,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditDomain);
