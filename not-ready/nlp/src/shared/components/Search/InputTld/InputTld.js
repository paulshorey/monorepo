import React from "react"
import { connect } from "react-redux"
import { Styled } from "src/shared/components/Search/InputTld/InputTld.styled"
import DropdownMenu from "./DropdownMenu"
import { Input } from "antd"
import { faAngleDown } from "@fortawesome/pro-light-svg-icons/faAngleDown"
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome"

class InputTld extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: props.value || "",
      focused: false,
      arrow_index: 0,
      forceSelect: false
    }
    // auto-focus the input (select) from Redux (outside the element)
    this.refInputTld = React.createRef()
  }

  componentDidUpdate(prevProps) {
    /*
     * Value change
     */
    if (this.props.value && this.props.value !== prevProps.value) {
      this.setState({
        value: this.props.value
      })
    }
    /*
     * Focus, open select options (when click somewhere else, change redux state)
     */
    if (this.props.focusSelectTld !== prevProps.focusSelectTld) {
      if (this.refInputTld.current) {
        this.refInputTld.current.focus()
      }
    }
  }

  render() {
    return (
      <Styled
        className={"InputTld " + (this.state.opened ? " opened" : "")}
        style={this.props.style || {}}
        onFocus={() => {
          this.setState({
            value: "",
            focused: true,
            arrow_index: 0
          })
          this.refInputTld.current.select()
        }}
        onBlur={() => {
          setTimeout(() => {
            let new_value = this.props.tlds_all[this.state.value] ? this.state.value : ""
            // save changes
            this.setState({
              focused: false,
              value: new_value || this.props.value,
              arrow_index: 0
            })
            // use new value
            if (new_value && new_value !== this.props.value) {
              this.props.handleSelect(new_value)
            }
          }, 300)
        }}
      >
        <Input
          ref={this.refInputTld}
          value={this.state.value}
          onChange={(event) => {
            console.log("InputTld onChange", event)
            this.setState({
              value: event.target.value.toLowerCase(),
              arrow_index: 0,
              focused: true
            })
          }}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              // if user typed a valid domain extension
              if (this.state.value && this.props.tlds_all[this.state.value.toLowerCase().trim()]) {
                this.props.handleSelect(this.state.value)
                this.setState({
                  focused: false
                })
              } else {
                this.setState({
                  forceSelect: true
                })
              }
            }
          }}
          onKeyDown={(event) => {
            /*
             * Allow user to navigate using keyboard arrows:
             */
            if (event.key === "ArrowDown") {
              this.setState({
                arrow_index: this.state.arrow_index + 1
              })
            } else if (event.key === "ArrowUp") {
              if (this.state.arrow_index > 0) {
                this.setState({
                  arrow_index: this.state.arrow_index - 1
                })
              }
            }
            /*
             * Does not seem to be possible to detect ESC key in latest browsers! :(
             */
          }}
        />

        <FA icon={faAngleDown} className="caret" style={{ transform: "scale(0.85)" }} />

        <DropdownMenu
          arrow_index={this.state.arrow_index}
          focused={this.state.focused}
          filter={this.state.value}
          forceSelect={this.state.forceSelect}
          handleSelect={(value) => {
            this.setState(
              {
                forceSelect: false,
                focus: false
              },
              () => {
                if (value !== this.state.value) {
                  this.props.handleSelect(value)
                }
                this.refInputTld.current.blur()
              }
            )
          }}
        />
      </Styled>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {}
}

const mapStateToProps = function (state) {
  return {
    tlds_all: state.output.tlds_all,
    focusSelectTld: state.ui.focusSelectTld
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InputTld)
