import React from "react";
import PosWord from "./PosWord";

class Field extends React.Component {
  render() {
    // validate
    let { row, field } = this.props;
    if (!row || typeof row[field] === undefined) {
      return <p>No {field}</p>;
    }
    // filter
    let label = field;
    let value = row[field];
    if (field === "ws_sentiment") {
      label = "sentiment";
      if (row.list_count >= 3) {
        value = value >= 0 ? "👍" : value === -1 ? "👎" : "undefined";
      } else {
        value = "?";
      }
    } else if (field === "str") {
      label = "string";
    } else {
      value = <PosWord word={value} />;
    }
    // display
    return (
      <div className={"ui-form-fieldset"}>
        <div className={"label"}>{label}:</div>
        <div className={"value"} style={{ maxWidth: 10000 }}>
          {value}
        </div>
      </div>
    );
  }
}

export default Field;
