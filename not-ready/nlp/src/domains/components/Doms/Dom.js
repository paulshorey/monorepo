import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/pro-regular-svg-icons/faHeart";
import { faSpinnerThird } from "@fortawesome/pro-regular-svg-icons/faSpinnerThird";
import { faSyncAlt } from "@fortawesome/pro-regular-svg-icons/faSyncAlt";
import { faDollarSign } from "@fortawesome/pro-regular-svg-icons/faDollarSign";
import { faCalendarExclamation } from "@fortawesome/pro-regular-svg-icons/faCalendarExclamation";
import * as io_actions from "src/shared/redux/actions/io";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import IconFrown from "src/shared/components/IconFrown";

// const str_highlight = function (str, input_words_arr) {
//   for (let word of input_words_arr) {
//     let iword = str.indexOf(word);
//     if (iword !== -1) {
//       let str_arr = [];
//       // add fragment before word
//       if (iword > 0) {
//         str_arr.push(<span className="faded">{str.substring(0, iword)}</span>);
//       }
//       // add highlighted word
//       str_arr.push(<span className="highlighted">{word}</span>);
//       // add fragment after word
//       if (iword + word.length < str.length) {
//         str_arr.push(<span className="faded">{str.substr(iword + word.length)}</span>);
//       }
//       return str_arr;
//     }
//   }
//   return <span className="faded">{str}</span>;
// };

class Dom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isIntersecting: false
    };
    this.ref = React.createRef();
  }

  componentDidMount() {
    this.observer = new IntersectionObserver(([entry]) => {
      this.setState({ isIntersecting: entry.isIntersecting });
    });
    if (this.ref.current) {
      this.observer.observe(this.ref.current);
    }
  }

  componentWillUnmount() {
    this.observer.disconnect();
  }

  render() {
    let {
      domain_availability_queue,
      domain_availability,
      input_tld,
      input_str,
      input_spellchecked,
      phraseString,
      io_actions
    } = this.props;
    phraseString = phraseString.trim();
    if (phraseString[0] === ".") return null;
    //
    // get domain status code
    let phraseStringNoSpaces = phraseString.replace(/ /g, "");
    let isExact =
      phraseStringNoSpaces === input_str.replace(/ /g, "") + "." + input_tld ||
      phraseStringNoSpaces === input_spellchecked.replace(/ /g, "") + " ." + input_tld;
    let nwords = phraseString.split(" ").length - 1;
    let len = phraseStringNoSpaces.length;
    let idot = phraseStringNoSpaces.indexOf(".");
    let sld = phraseStringNoSpaces.substring(0, idot);
    let tld = phraseStringNoSpaces.substring(idot + 1, len);
    let code = Number(domain_availability[phraseStringNoSpaces] || 0);
    //
    // is visible ? check availability ?
    if (
      this.state.isIntersecting &&
      !domain_availability_queue[phraseStringNoSpaces] &&
      !domain_availability[phraseStringNoSpaces]
    ) {
      io_actions.RX__domain_add_to_availability_queue(phraseStringNoSpaces);
    }
    //
    // unknown
    let status = "other";
    let Icon = <FA key={status} icon={faSyncAlt} />;
    //
    // unknown
    if (!code) {
      status = "unknown";
      Icon = <FA key={status} className="faRedo" icon={faSpinnerThird} />;
    }
    // unavailable
    else if (code < 2) {
      status = "unavailable";
      Icon = <IconFrown key="2" />;
    }
    // available
    else if (code === 2) {
      if (phraseString.substr(phraseString.indexOf(".")) === ".com") {
        status = "available-dotcom";
        Icon = [<FA key={1} icon={faHeart} className="faHeart" />];
      } else {
        status = "available";
        Icon = <FA key={1} icon={faHeart} className="faHeart" />;
      }
    }
    // expiring
    else if (code === 6) {
      status = "expiring";
      Icon = <FA key={1} icon={faCalendarExclamation} />;
    }
    // premium unknown
    else if (code === 4 || code === 5) {
      if (phraseString.substr(phraseString.indexOf("."), 4) === ".com") {
        status = "premium-dotcom";
      } else {
        status = "premium";
      }
      Icon = [
        <FA key={1} icon={faDollarSign} className="faDoubleDollarSign" />,
        <FA key={2} icon={faDollarSign} className="faDoubleDollarSign" />
      ];
      // if (!phraseString.includes("-")) {
      //   // extra expensive:
      //   if (((tld === "com" || nwords === 1) && len < 20) || len < 10) {
      //     Icon.push(<FA key={3} icon={faDollarSign} className="faDoubleDollarSign" />);
      //   }
      //   // extra expensive from registry
      //   if (code === 5) {
      //     Icon.push(<FA key={4} icon={faDollarSign} className="faDoubleDollarSign" />);
      //   }
      // }
      // <span className="price">{Math.floor(code)}</span>
    }
    // premium
    else if (code === 3) {
      if (phraseString.substr(phraseString.indexOf(".")) === ".com") {
        status = "available-dotcom";
      } else {
        status = "available";
      }
      Icon = [<FA key={1} icon={faDollarSign} className="faDoubleDollarSign" />];
    }
    let phraseArr = phraseString.split(" ");
    return (
      <div ref={this.ref} className={`dom_name status-${status} ${isExact ? "status-exact" : ""}`}>
        <span
          className={"link dom_card code-" + code}
          onClick={() => {
            if (code === 4) {
              window.open(`https://sedo.com/search/?keyword=${sld}.${tld}&campaignId=326988`);
              // window.open(`https://sedo.com/checkdomainoffer.php?language=us&domain=${sld}.${tld}&language=us&campaignId=326988`);
              // window.open(`https://www.afternic.com/search?k=${sld}&tld=${tld}`, "_blank");
            } else {
              window.open101Domain(phraseStringNoSpaces);
            }
          }}
        >
          <span className="icon">{Icon}</span>
          <span>
            {/*
             * display spaces as kerning
             */}
            {phraseArr.map((str, i) => (
              <span key={str + i} className="word">
                {str}
                {/*{str_highlight(str, input_words_arr)}*/}
              </span>
            ))}
          </span>
        </span>
      </div>
    );
  }
}

/*******************************************************************************************************
 * this.props DOCUMENTATION
 *******************************************************************************************************/

const mapDispatchToProps = (dispatch) => {
  return {
    io_actions: bindActionCreators(io_actions, dispatch)
  };
};

const mapStateToProps = function (state) {
  return {
    domain_availability_queue: state.output.domain_availability_queue
    // domain_availability:state.output.domain_availability,
    // input_tld:state.output.input_tld,
    // input_str:state.output.input_str,
    // input_spellchecked:state.output.input_spellchecked,
  };
};

Dom.propTypes = {
  phraseString: PropTypes.string, // domain string suggestion to show, with spaces
  domain_availability: PropTypes.object,
  input_tld: PropTypes.string,
  input_str: PropTypes.string,
  input_spellchecked: PropTypes.string
};

export default connect(mapStateToProps, mapDispatchToProps)(Dom);
