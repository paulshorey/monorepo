import React from "react";
import Link from "next/link";

class DomExt extends React.Component {
  render() {
    if (!this.props.domext) {
      return null;
    }
    return (
      <span>
        {/*
         * word
         */}
        <span className={"posword"}>
          {!this.props.noLink ? (
            <Link
              href={`/edit_domain?tld=${this.props.domext}`}
              onClick={() => {
                window.isLoading("render");
              }}
            >
              <a>.{this.props.domext},&nbsp;</a>
            </Link>
          ) : (
            <>.{this.props.domext},&nbsp;</>
          )}
        </span>
      </span>
    );
  }
}

export default DomExt;
