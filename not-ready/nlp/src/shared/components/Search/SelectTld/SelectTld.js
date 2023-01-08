import React from "react"
import { connect } from "react-redux"
import Select from "react-select"
import { Styled } from "src/shared/components/Search/SelectTld/SelectTld.styled"

class SelectTld extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: undefined,
      options: [],
      autoFocus: false,
      showingAllOptions: false,
      opened: false
    }
    this.refSelectTld = React.createRef()
  }

  componentDidMount() {
    // tld list options
    this.newOptions(25)
    // initially selected value
    if (this.props.value) {
      this.setState({
        value: this.props.value
      })
    }
  }

  componentDidUpdate(prevProps) {
    /*
     * Focus, open select options (when click somewhere else, change redux state)
     */
    if (prevProps.focusSelectTld !== this.props.focusSelectTld) {
      if (this.refSelectTld.current) {
        this.refSelectTld.current.focus()
      }
    }
    /*
     * User selected value
     */
    if (prevProps.value !== this.props.value) {
      // React-Select component requires its value prop to be not a simple string value,
      // but a reference to one of the options!
      let opt = this.state.options.find((opt) => opt.value === this.props.value)
      this.setState({
        selectedOption: opt
      })
    }
  }

  /**
   * re-generates this.state.Options
   * @param limit {number}
   */
  newOptions = (limit = undefined) => {
    console.log("newOptions", limit)
    // make <option> for each .tld in list
    let defaultSelectedOption = null
    let selectedOption = null
    let options = []
    /*
     * add all
     */
    let tlds = this.props.tlds_all
    let ti = 0
    for (let tld in tlds) {
      // limit
      if (limit && ti > limit) break
      // add option
      let opt = {
        value: tld,
        label: (
          <span>
            <b>.</b>
            {tld}
          </span>
        )
      }
      options.push(opt)
      if (opt.value === this.props.value) {
        selectedOption = opt
      }
      if (opt.value === "com") {
        defaultSelectedOption = opt
      }
      // next
      ti++
    }
    /*
     * add selected option
     * (if limited results, and limited results do not include selected option)
     */
    if (!selectedOption && this.props.value) {
      let opt = {
        value: this.props.value,
        label: (
          <span>
            <b>.</b>
            {this.props.value}
          </span>
        )
      }
      options.push(opt)
      selectedOption = opt
    }
    /*
     * set, and remember if showing all
     */
    this.setState({
      options,
      autoFocus: false,
      showingAllOptions: !limit,
      selectedOption: selectedOption || defaultSelectedOption
    })
  }

  onBlur = () => {
    this.closeMenu()
    this.newOptions(25)
  }
  closeMenu = () => {
    this.setState({ opened: false })
  }

  onFocus = () => {
    console.log("onFocus")
    this.openMenu()
    setTimeout(() => {
      this.newOptions()
    }, 500)
  }
  openMenu = () => {
    this.setState({ opened: true })
  }

  render() {
    return (
      <Styled className={"SelectTld " + (this.state.opened ? " opened" : "")}>
        <Select
          // classNamePrefix="DoNotUse-ThisMakesItWorse"
          openMenuOnFocus={true}
          ref={this.refSelectTld}
          value={this.state.selectedOption}
          placeholder={
            this.props.placeholder || (
              <>
                <b>.</b>com
              </>
            )
          }
          onChange={(item) => {
            this.onBlur()
            if (this.props.onSelect) {
              this.props.onSelect(item.value)
            }
          }}
          isSearchable={true}
          options={this.state.options}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
        ></Select>
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

export default connect(mapStateToProps, mapDispatchToProps)(SelectTld)
