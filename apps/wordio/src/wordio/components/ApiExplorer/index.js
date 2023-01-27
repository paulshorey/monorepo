import React from "react";
import ReactJson from "react-json-view";
import { ApiExplorerStyled } from "./styled.js";
import { faSearch } from "@fortawesome/pro-solid-svg-icons/faSearch";
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";
import { v1_get } from "src/shared/http/v1";
import InputGroup from "@techytools/ui/components/InputGroup";
import Input from "@techytools/ui/components/Input";
import Button from "@techytools/ui/components/Button";
import apis from "./data/apis";

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fetching: false,
      api_endpoint: "/v1/string/spellcheck-tokenize",
      api_input: apis["/v1/string/spellcheck-tokenize"].input,
      api_input_original: apis["/v1/string/spellcheck-tokenize"].input,
      api_output: apis["/v1/string/spellcheck-tokenize"].output,
    };
  }

  render() {
    return (
      <ApiExplorerStyled className="ApiExplorer">
        {/* <div className="heading">
          <div className="content">Try the API:</div>
        </div> */}
        <article>
          <nav className="side">
            <ul>{Object.entries(apis).map(([key, value]) => this.ApiNavItem(key, value))}</ul>
          </nav>
          <main
            className="main"
            onScroll={() => {
              if (typeof window === "object") {
                window.scrollTo({ top: 1000, behavior: "smooth" });
              }
            }}
          >
            <pre>
              <code>
                {this.state.api_output && (
                  <ReactJson
                    src={this.state.api_output}
                    iconStyle="triangle"
                    displayDataTypes={false}
                    name={false}
                    enableClipboard={false}
                    displayObjectSize={false}
                  />
                )}
              </code>
            </pre>
          </main>
        </article>
      </ApiExplorerStyled>
    );
  }

  ApiNavItem = (api_endpoint, api) => {
    if (api_endpoint === this.state.api_endpoint) {
      return (
        <li className="active" key={api_endpoint}>
          <div className="content">
            <b className="ui_label">
              {api_endpoint}
              {/* <Tip /> */}
            </b>
            <InputGroup className="ui_fieldset">
              <Input
                type="text"
                placeholder="..."
                value={this.state.api_input}
                onChange={(event) => {
                  this.setState({
                    api_input: event.target.value,
                  });
                }}
                onKeyPress={(event) => {
                  if (!this.state.fetching && event.key === "Enter" && this.state.api_input !== this.state.api_input_original) {
                    this.fetchData();
                  }
                }}
                onBlur={() => {
                  if (!this.state.fetching && this.state.api_input !== this.state.api_input_original) {
                    this.fetchData();
                  }
                }}
              />
              <Button bgcolor="cool">
                <FA icon={faSearch} />
              </Button>
            </InputGroup>
          </div>
        </li>
      );
    } else {
      return (
        <li
          key={api_endpoint}
          className=""
          onClick={() => {
            this.setState(
              {
                api_input: api.input,
                api_output: api.output,
                api_endpoint: api_endpoint,
                api_input_original: api_endpoint,
              },
              this.fetchData
            );
          }}
        >
          <div className="content">{api_endpoint}</div>
        </li>
      );
    }
  };

  fetchData = async () => {
    // reset state while waiting for real output to come back
    this.setState({
      fetching: true,
      api_output: "",
    });
    // use custom function
    let data = await v1_get(this.state.api_endpoint, { str: this.state.api_input });
    console.log("data", data);
    if (!data || typeof data !== "object") {
      data = this.state.api_output || { error: "No output" };
    }
    this.setState({
      fetching: false,
      api_output: data,
    });
  };
}
