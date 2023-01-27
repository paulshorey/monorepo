import React from "react"

const styles = {
  Hint: {
    display: "block",
    lineHeight: "1em",
    fontSize: "0.67em",
    fontWeight: "bold",
    padding: "0",
    margin: "0"
  }
}

export default (props) => {
  // validate
  let { style = {}, className = "", children } = props
  if (!children) {
    return null
  }
  // display
  return (
    <span className={className} style={{ ...styles.Hint, ...style }}>
      {children}
    </span>
  )
}
