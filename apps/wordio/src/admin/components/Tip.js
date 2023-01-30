import React from "react"
import { faQuestion } from "@fortawesome/pro-solid-svg-icons/faQuestion"
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome"

const styles = {
  sup: {
    opacity: "0.5",
    padding: "0 0.25rem 0.75rem 0.25rem",
    top: "-0.5rem",
    cursor: "pointer",
    color: "var(--color-light)"
  }
}

class Tip extends React.Component {
  render() {
    return (
      <sup style={styles.sup}>
        <FA icon={faQuestion} className="faQuestion" style={{ transform: "scale(0.85)" }} />
      </sup>
    )
  }
}

export default Tip
