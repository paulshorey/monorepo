import React from "react";
import { StyledApp } from "./App.styled.js";
import Head from "next/head";
import { bindActionCreators } from "redux";
// import { withRouter } from 'next/router'

import * as io_actions from "src/shared/redux/actions/io";
import * as ui_actions from "src/shared/redux/actions/ui";
import { connect } from "react-redux";
// import { object_from_querystring } from "@techytools/fn/io/urls"

// const isPhone = function () {
//   if (typeof navigator !== "object") {
//     return false
//   }
//   const toMatch = [/Android/i, /webOS/i, /iPhone/i, /iPod/i, /BlackBerry/i, /Windows Phone/i]
//   return toMatch.some((toMatchItem) => {
//     return navigator.userAgent.match(toMatchItem)
//   })
// }

const DEBUG1 = true;
class App extends React.Component {
  trackPageview = () => {
    if (typeof window === "object" && window.ga) {
      // window.ga("send", {
      //   hitType: "pageview",
      //   page: this.props.router.asPath,
      //   location: this.props.router.asPath
      // })
    }
  };
  componentDidMount() {
    // update tld
    // let url_obj = object_from_querystring(this.props.router.asPath)
    // this.props.io_actions.RX__set_inputs(url_obj)
    setTimeout(function () {
      window.scrollTo(0, 1);
    }, 100);
    // track pageview
    this.trackPageview();
    // on page load, show all on one list
    // if (typeof window === "object") {
    //   // for mobile device, show all results on one list
    //   if (window.innerWidth < 1300) {
    //     this.props.ui_actions.RX__toggle_key("show_one_list", true)
    //   }
    //   window.onresize = () => {
    //     if (typeof this === "object" && this.props && this.props.ui_actions) {
    //       if (window.innerWidth < 1300) {
    //         this.props.ui_actions.RX__toggle_key("show_one_list", true)
    //       }
    //     }
    //   }
    // }
  }
  componentDidUpdate(prevProps) {
    // // reset inputs if visit homepage
    // if (!this.props.router.asPath && prevProps.router.asPath !== this.props.router.asPath) {
    //   this.props.io_actions.RX__clear_inputs()
    // }
    // track pageview
    // if (this.props.router.asPath !== prevProps.router.asPath) {
    //   this.trackPageview()
    // }
  }
  render() {
    const { children } = this.props;
    return (
      <StyledApp>
        <Head>
          <meta charSet="utf-8" />
          <title>{this.props.redux__meta_title || this.props.meta_title}</title>
          {/*{!!isPhone() ? (*/}
          {/*  <meta name="viewport" content="width=450, initial-scale=1.0, maximum-scale=1.0" />*/}
          {/*) : (*/}
          {/*  <meta name="viewport" content="width=device-width" />*/}
          {/*)}*/}
          <meta name="viewport" content="width=device-width, initial-scale=0.86, maximum-scale=0.86, user-scalable=no" />
        </Head>
        {children}
      </StyledApp>
    );
  }
}

/*******************************************************************************************************
 * this.props DOCUMENTATION
 *******************************************************************************************************/

const mapDispatchToProps = (dispatch) => {
  return {
    io_actions: bindActionCreators(io_actions, dispatch),
    ui_actions: bindActionCreators(ui_actions, dispatch),
  };
};

const mapStateToProps = function (state) {
  return {
    redux__meta_title: state.ui.meta_title, // string
    input_str: state.input.str, // string
    input_tld: state.input.tld, // string
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
