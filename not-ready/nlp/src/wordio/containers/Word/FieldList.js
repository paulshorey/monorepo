import React from "react";
import { faAngleUp } from "@fortawesome/pro-solid-svg-icons/faAngleUp";
import { faEllipsisH } from "@fortawesome/pro-solid-svg-icons/faEllipsisH";
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";
import PosWord from "./PosWord";

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      advanced: false
    };
  }

  render() {
    let { field, row } = this.props;
    let label = field;
    if (field === "list") {
      label = "all";
    }
    /*
     * Validate
     */
    if (!field || !Array.isArray(row[field])) {
      return null;
    }
    /*
     * Predefined lists of words
     * info = [ 0-1 (bad-ok), 0-1 (ok-proper), 0-1 (ok-unknown) ]
     * ok = [ 1, 0, 0 ]
     */
    let ListOk = row[field]
      .map((word, i) => {
        return <PosWord word={word} key={word + i} />;
      })
      .filter((val) => !!val);
    /*
     * Render simple version:
     */
    if (!this.state.advanced) {
      return (
        <div className={"ui-form-section simple"}>
          <div>
            {ListOk.length > 0 && (
              <>
                <div className={"one"}>
                  <b>{label}: </b>
                </div>
                <div className="two fieldWords">{ListOk}</div>
              </>
            )}
            <div
              className={"three"}
              onClick={() => {
                this.setState({ advanced: true });
              }}
            >
              <FA icon={faEllipsisH} className="faEllipsisH" style={{ transform: "scale(0.85)" }} />
            </div>
          </div>
        </div>
      );
    } else {
      /*
       * Render advanced version:
       */
      return (
        <div className={"ui-form-section advanced"}>
          <p className={"one"}>
            <b className="title">{field}:</b>
          </p>

          <div className={"two"}>{ListOk.length > 0 && <p className="fieldWords">{ListOk}</p>}</div>

          <p
            className={"three"}
            onClick={() => {
              this.setState({ advanced: false });
            }}
          >
            <FA icon={faAngleUp} className="faAngleUp" style={{ transform: "scale(0.85)" }} />
          </p>
        </div>
      );
    }
  }
}
