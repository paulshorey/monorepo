import React from "react";
import ReactJson from "react-json-view";
import { ApiExplorerStyled } from "./styled.js";
import { faSearch } from "@fortawesome/pro-solid-svg-icons/faSearch";
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";
import { v1_get } from "src/shared/http/v1";
import InputGroup from "@techytools/ui/components/InputGroup";
import Input from "@techytools/ui/components/Input";
import Button from "@techytools/ui/components/Button";

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      api_endpoint: "/v1/string/spellcheck-tokenize",
      api_input: apis["/v1/string/spellcheck-tokenize"].input,
      api_input_original: apis["/v1/string/spellcheck-tokenize"].input,
      api_output: apis["/v1/string/spellcheck-tokenize"].output,
    };
  }

  render() {
    return (
      <ApiExplorerStyled className="ApiExplorer">
        <div className="heading">
          <div className="content">Try the API:</div>
        </div>
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
                  if (event.key === "Enter" && this.state.api_input !== this.state.api_input_original) {
                    this.fetchData();
                  }
                }}
                onBlur={() => {
                  if (this.state.api_input !== this.state.api_input_original) {
                    this.fetchData();
                  }
                }}
              />
              <Button>
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
      api_output: "",
    });
    // use custom function
    let data = await v1_get(this.state.api_endpoint, { str: this.state.api_input });
    console.log("data", data);
    if (!data || typeof data !== "object") {
      data = this.state.api_output || { error: "No output" };
    }
    this.setState({
      api_output: data,
    });
  };
}

const apis = {
  "/v1/string/spellcheck-tokenize": {
    input: "unitstateofamerica",
  },
  "/v1/string/spellcheck": {
    input: "unitstateofamerica",
  },
  "/v1/string/tokenize": {
    input: "unitstateofamerica",
  },
  "/v1/string/break": {
    input: "unitstateofamerica",
  },
  "/v1/word": {
    input: "state",
  },
  "/v1/word/synonyms": {
    input: "united",
  },
  "/v1/domain/suggestions": {
    input: "helloworld",
  },
  "/v1/word/definitions": {
    input: "tokenization",
    output: {
      definitions: [],
    },
  },
};

apis["/v1/string/spellcheck-tokenize"].output = {
  string: "unitedstatesofamerica",
  chunks: [["United States of America"], ["United States", "of", "America"], ["united", "states", "of", "America"]],
  chunks_info: {
    "United States of America": {
      sentiment: 0,
      pos1: "nouns",
      nouns: ["america", "states"],
    },
    "United States": {
      singular: "united state",
      sentiment: 0,
      pos1: "nouns",
      nouns: ["united states government", "union"],
    },
    united: {
      sentiment: 0,
      pos1: "adjectives",
      pos2: "verbs",
      pos3: "nouns",
      adjectives: [
        "united",
        "unitary",
        "unified",
        "combined",
        "allied",
        "cooperative",
        "mutual",
        "agreeable",
        "amicable",
        "linked",
        "integrated",
        "consolidated",
        "merged",
        "unanimous",
        "compatible",
        "harmonious",
      ],
      verbs: ["uniting", "unify", "unite", "coalesced", "amalgamate", "federate", "incorporate", "wed", "associate"],
    },
    states: {
      singular: "state",
      sentiment: 0,
      pos1: "nouns",
      pos2: "verbs",
      pos3: "adjectives",
      nouns: [
        "states",
        "status",
        "state",
        "countries",
        "nations",
        "nation",
        "form",
        "country",
        "nature",
        "land",
        "posture",
        "commonwealth",
        "province",
        "provinces",
        "republic",
        "conditions",
        "condition",
        "commonwealths",
        "shape",
        "sovereigns",
        "superpower",
        "kingdoms",
        "republics",
        "empires",
        "situation",
        "domains",
      ],
      verbs: [
        "express",
        "say",
        "tell",
        "affirm",
        "stipulates",
        "aver",
        "specifies",
        "submit",
        "requires",
        "expound",
        "prescribes",
        "assert",
        "determines",
        "formulate",
        "declares",
        "declare",
        "mentions",
        "verbalize",
        "says",
        "put",
        "establishes",
        "posit",
        "asserts",
      ],
    },
    of: {
      sentiment: 0,
      pos1: "prepositions",
      pos2: "adjectives",
      prepositions: ["of", "concerning", "regarding", "over", "anent"],
      adjectives: ["touching"],
    },
    America: {
      name: true,
      sentiment: 0,
      pos1: "nouns",
      pos2: "adjectives",
      nouns: ["america", "amer", "americas"],
    },
  },
};

apis["/v1/domain/suggestions"].output = {
  status: "success",
  code: 200,
  data: {
    string_original: "hellowrld",
    tld: "com",
    string: "hello world",
    tlds: ["world", "fyi", "earth", "info", "global", "travel", "international", "us", "eco"],
    domains: {
      tld: ["hellowrld .fyi", "hellowrld .earth", "hellowrld .info", "hellowrld .global"],
      name: ["hola society .com", "howdy .earth", "well hello .world", "shalom .travel", "earth .eco", "hello there .earth", "society .space"],
      "word hack": ["worlda .eco", "planet .io", "orbus .org"],
      "phrase hack": ["get hellowrld .eco", "my hellowrld .app", "hellowrld online .com"],
    },
  },
};
