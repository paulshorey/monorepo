import { connect } from "react-redux";
import Logo from "./Logo";
import { StyledHeadContainer, StyledHeader, StyledHead, StyledHeadUnder, StyledToplinks, StyledLogoContainer } from "./index.styled";
import { bindActionCreators } from "redux";
import * as io_actions from "src/shared/redux/actions/io";
import * as ui_actions from "src/shared/redux/actions/ui";
import { withRouter } from "next/router";
import HeaderDropdown from "./Dropdown";

const Header = (props) => {
  let { home, standalone, wide, hidebeta } = props;

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
            <h2 className="StyledLogo">
              <Logo {...props} />
            </h2>
          </StyledLogoContainer>

          {/*
           * Links
           */}
          <StyledToplinks className={home ? "home" : ""}>
            <a href="https://documenter.getpostman.com/view/23360867/2s8YzXtewC" target="_blank" className="second">
              API Documentation
            </a>
            {/*
             * Hamburger / Dropdown
             */}
            <HeaderDropdown />
          </StyledToplinks>
        </StyledHeader>
      </StyledHead>
    </StyledHeadContainer>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    io_actions: bindActionCreators(io_actions, dispatch),
    ui_actions: bindActionCreators(ui_actions, dispatch),
  };
};
const mapStateToProps = function (state) {
  return {
    input_str: state.input.str,
    input_tld: state.input.tld,
    input_first_word: state.input.first_word,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Header));
