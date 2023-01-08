import React from "react";
import { connect } from "react-redux";
import Link from "next/link";
import {
  StyledHeaderDropdownOverlay,
  StyledHeaderDropdown,
  StyledHeadContainer,
  StyledHeader,
  StyledHead,
  StyledLogoLink,
  StyledHeadUnder,
  StyledToplinks,
  StyledRightHamburger,
  StyledLogoContainer
} from "./Header.styled";
import { Menu } from "antd";
import { faBars } from "@fortawesome/pro-regular-svg-icons/faBars";
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";
import { bindActionCreators } from "redux";
import * as io_actions from "src/shared/redux/actions/io";
import * as ui_actions from "src/shared/redux/actions/ui";
import { _ } from "src/domains/containers/Results/Results.styled";
import { withRouter } from "next/router";

const PRODUCTION = process.env.NODE_ENV !== "development";
const HOST = process.env.NEXT_PUBLIC_HOST;
const WORDIO = HOST === "wordio.co";
const DOMAINS = !WORDIO;

export const BestaDomainsLogo = ({ home }) => {
  if (!!home) {
    return (
      <StyledLogoLink>
        <Link
          href="/"
          onClick={() => {
            setTimeout(function () {
              if (typeof window === "object") window.scrollTo({ top: 0, behavior: "smooth" });
            }, 300);
          }}
        >
          <a>
            <span className="color-highlight-primary">besta</span>
            <span className="color-xhighlight-secondary">
              .<_ />
              domains
            </span>
            <span className="beta">beta</span>
          </a>
        </Link>
      </StyledLogoLink>
    );
  } else {
    return (
      <StyledLogoLink>
        <a href="/">
          <span className="color-highlight-primary">besta</span>
          <span className="color-xhighlight-secondary">
            .<_ />
            domains
          </span>
          <span className="beta">beta</span>
        </a>
      </StyledLogoLink>
    );
  }
};
export const WordioCoLogo = ({ home }) => {
  if (!!home) {
    return (
      <StyledLogoLink>
        <Link
          href="/"
          onClick={() => {
            setTimeout(function () {
              if (typeof window === "object") window.scrollTo({ top: 0, behavior: "smooth" });
            }, 300);
          }}
        >
          <a>
            <span className="color-accent">wordio</span>
            <span className="color-white">
              .<_ />
              co
            </span>
            <span className="beta">beta</span>
          </a>
        </Link>
      </StyledLogoLink>
    );
  } else {
    return (
      <StyledLogoLink>
        <a href="/">
          <span className="color-accent">wordio</span>
          <span className="color-white">
            .<_ />
            co
          </span>
          <span className="beta">beta</span>
        </a>
      </StyledLogoLink>
    );
  }
};

class AccountMenu extends React.Component {
  render() {
    // view
    return (
      <Menu className={"MenuDropdownHeaderRight"}>
        {/*
         * About
         */}
        <div className="spacer" />
        <Menu.Item>
          <h6>
            <Link href="/about">
              <a>About Us</a>
            </Link>
          </h6>
          <h6>
            <Link href="/contact">
              <a>Contact Us</a>
            </Link>
          </h6>
        </Menu.Item>
        {/*
         * Apps
         */}
        <div className="divider">Apps:</div>
        <Menu.Item>
          <h6>
            <a href="https://besta.domains" target="_blank">
              Domain Suggestions
            </a>
          </h6>
        </Menu.Item>
        <Menu.Item>
          <h6>
            <a href="https://wordio.co" target="_blank">
              Thesaurus
            </a>
          </h6>
        </Menu.Item>
        {/*
         * APIs
         */}
        <div className="divider">Services:</div>
        <Menu.Item>
          <h6>
            <a target="_blank" href="https://documenter.getpostman.com/view/23360867/2s8YzXtewC">
              API Documentation
            </a>
          </h6>
        </Menu.Item>
        {/*
         * Admin tools
         */}
        {PRODUCTION ? (
          <>
            {/* <Menu.Item className="small h6">
              <Link href={"/contact"}>
                <a>
                  <b className="color-accent">Demo our admin tools</b>
                </a>
              </Link>
            </Menu.Item> */}
          </>
        ) : (
          <>
            <div className="divider">Demo our admin tools:</div>
            <Menu.Item className="small h6">
              <Link href={"/edit_word" + (this.props.first_word !== "" ? "?str=" + this.props.first_word : "")}>
                <a>
                  <b className="color-accent">Edit word</b>
                </a>
              </Link>
            </Menu.Item>
            <Menu.Item className="small h6">
              <Link
                href={
                  "/edit_domain" +
                  (this.props.input_tld !== "" && this.props.input_tld !== "com" ? "?tld=" + this.props.input_tld : "")
                }
              >
                <a>
                  <b className="color-accent">Edit domain</b>
                </a>
              </Link>
            </Menu.Item>
            <Menu.Item className="small h6">
              <a href={"/all_domains"} target="_blank">
                <b className="color-accent">All domains</b>
              </a>
            </Menu.Item>
            <Menu.Item className="small h6">
              <Link href={"/suggestions?str=better travel together&wordposs=1"}>
                <a>
                  <b className="color-accent">Domain suggestions</b>
                </a>
              </Link>
            </Menu.Item>
          </>
        )}
      </Menu>
    );
  }
}

class ThisComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showNav: false
    };
  }

  render() {
    let { home, router, standalone, wide, hidebeta } = this.props;
    let Logo = WORDIO ? WordioCoLogo(this.props) : BestaDomainsLogo(this.props);

    return (
      <StyledHeadContainer className={standalone ? "wrapInContainer" : ""}>
        {!!home && <StyledHeadUnder />}
        <StyledHead className={"StyledHead " + (home ? " isHome" : "")} style={{ position: !!home ? "fixed" : "" }}>
          {/*
           * Header Bar
           */}
          <StyledHeader className={"StyledHeader content " + (wide ? "verywide" : "")}>
            {/*
             * Logo
             */}
            <StyledLogoContainer className={hidebeta ? " hidebeta" : ""}>
              <a name="top" />
              <h2 className="StyledLogo">{Logo}</h2>
            </StyledLogoContainer>

            {/*
             * Links
             */}
            {!!DOMAINS ? (
              <StyledToplinks className={home ? "home" : ""}>
                <>
                  <a
                    href="/#examples"
                    className="fourth"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push("/");
                      let scrollDown = function () {
                        let el = document.querySelector('[name="examples"]');
                        if (el) {
                          el.scrollIntoView({
                            behavior: "smooth"
                          });
                        }
                      };
                      setTimeout(scrollDown, home ? 300 : 700);
                    }}
                  >
                    examples
                  </a>
                  <a
                    href="/#features"
                    className="second"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push("/");
                      let scrollDown = function () {
                        let el = document.querySelector('[name="features"]');
                        if (el) {
                          el.scrollIntoView({
                            behavior: "smooth"
                          });
                        }
                      };
                      setTimeout(scrollDown, home ? 300 : 700);
                    }}
                  >
                    features
                  </a>
                </>
              </StyledToplinks>
            ) : (
              <StyledToplinks className={home ? "home" : ""}>
                <>
                  <a
                    href="https://documenter.getpostman.com/view/23360867/2s8YzXtewC"
                    target="_blank"
                    className="second"
                  >
                    API Documentation
                  </a>
                </>
              </StyledToplinks>
            )}

            {/*
             * Hamburger Menu
             */}
            <StyledRightHamburger
              className="StyledRightHamburger"
              onMouseOver={() => {
                this.setState({ showNav: true });
              }}
            >
              <FA icon={faBars} className="faBars" />
            </StyledRightHamburger>
            {/*
             * Top-Right Dropdown Nav Menu
             */}
            <StyledHeaderDropdown className={this.state.showNav ? "visible" : "hidden"}>
              <AccountMenu {...this.props} />
            </StyledHeaderDropdown>
            <StyledHeaderDropdownOverlay
              className={this.state.showNav ? "visible" : "hidden"}
              onMouseOver={() => {
                this.setState({ showNav: false });
              }}
            />
          </StyledHeader>
        </StyledHead>
      </StyledHeadContainer>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    io_actions: bindActionCreators(io_actions, dispatch),
    ui_actions: bindActionCreators(ui_actions, dispatch)
  };
};
const mapStateToProps = function (state) {
  return {
    input_str: state.input.str,
    input_tld: state.input.tld,
    input_first_word: state.input.first_word
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ThisComponent));
