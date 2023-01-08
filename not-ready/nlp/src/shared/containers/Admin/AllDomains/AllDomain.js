import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as io_actions from "src/shared/redux/actions/io";
import * as ui_actions from "src/shared/redux/actions/ui";
import api_actions from "src/shared/redux/actions/api";
import { StyledDomains } from "./AllDomain.styled";
import { load_script } from "@techytools/fn/browser/requests";
import Head from "next/head";

class AllDomain extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      all_domains: [],
    };
  }

  getAllDomains = async () => {
    let doms = await this.props.api_actions.data_domains_all();
    this.setState({
      all_domains: doms || [],
    });
  };
  componentDidMount = async () => {
    // get data
    await this.getAllDomains();
    // make minimap of data after its loaded
    setTimeout(async () => {
      await load_script("/scripts/pagemap.min.js");
      setTimeout(() => {
        if (typeof window === "object" && window.pagemap) {
          window.pagemap(document.querySelector("#domains_minimap"), {
            viewport: null,
            styles: {
              b: "hsl(90, 100%, 33%)",
              span: "hsl(200, 50%, 50%)",
            },
            back: "rgba(0,0,0,0.0)",
            view: "rgba(0,0,0,0.25)",
            drag: "rgba(0,0,0,0.125)",
            interval: null,
          });
        }
      }, 4000);
    }, 2000);
  };

  render() {
    let { all_domains } = this.state;
    return (
      <>
        <Head>
          <title>Admin All Domains</title>
        </Head>
        <StyledDomains>
          <canvas id="domains_minimap"> </canvas>
          <div id="domains_content">
            {!!all_domains.length &&
              all_domains.map((item, i) => {
                return (
                  <div className={`line ${i % 2 ? "even" : "odd"}`}>
                    <b className="key">
                      <a href={`/edit_domain?tld=${item.key}`} target="_blank">
                        {item.key}
                      </a>
                    </b>
                    <span className="value">
                      : &nbsp;&nbsp;
                      {!!item.syns1 &&
                        item.syns1.map((syn) => (
                          <span key={syn}>
                            <a href={`/edit_word?str=${syn}`} target="_blank">
                              {syn}
                            </a>
                            ,&nbsp;
                          </span>
                        ))}
                      {!!item.syns && item.syns}
                    </span>
                  </div>
                );
              })}
          </div>
        </StyledDomains>
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

export default connect(mapStateToProps, mapDispatchToProps)(AllDomain);
