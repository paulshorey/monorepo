import React from "react";
import ReactJson from "react-json-view";
import { ApiExplorerStyled } from "./styled.js";
// import Link from "next/link";
// import Tip from "src/shared/components/Tip";
// import { faCode } from "@fortawesome/pro-solid-svg-icons/faCode";
import { faArrowRight } from "@fortawesome/pro-solid-svg-icons/faArrowRight";
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";
import { v1_get } from "src/shared/http/v1";

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      api_endpoint: apis["spellcheck-tokenize"].endpoint,
      api_input: apis["spellcheck-tokenize"].input,
      api_input_original: apis["spellcheck-tokenize"].input,
      api_output: apis["spellcheck-tokenize"].output,
    };
  }

  render() {
    return (
      <ApiExplorerStyled className="ApiExplorer">
        <article>
          <nav className="side">
            <ul>{Object.values(apis).map((api) => this.apiNavItem(api))}</ul>
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

  apiNavItem = (api) => {
    if (api.endpoint === this.state.api_endpoint) {
      return (
        <li className="active" key={api.endpoint}>
          <div className="content">
            <b>
              /v1/{api.endpoint}
              {/* <Tip /> */}
            </b>
            <fieldset className="ui_fieldset">
              <input
                type="text"
                placeholder="..."
                value={this.state.api_input}
                className="ui_input medium shadow"
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
              <button className="ui_button link medium shadow">
                <FA icon={faArrowRight} className="x85" />
              </button>
            </fieldset>
          </div>
        </li>
      );
    } else {
      return (
        <li
          key={api.endpoint}
          className=""
          onClick={() => {
            this.setState(
              {
                api_input: api.input,
                api_output: api.output,
                api_endpoint: api.endpoint,
                api_input_original: api.endpoint,
              },
              this.fetchData
            );
          }}
        >
          <div className="content">/v1/{api.endpoint}</div>
        </li>
      );
    }
  };

  fetchData = async () => {
    // if (this.state.api_output) {
    // use the demo output
    // } else {
    // reset state while waiting for real output to come back
    this.setState({
      api_output: "",
    });
    // use custom function
    this.setState({
      api_output: await v1_get(this.state.api_endpoint, { str: this.state.api_input }),
    });
    // }
  };
}

const apis = {
  "spellcheck-tokenize": {
    endpoint: "spellcheck-tokenize",
    input: "unitstateofamerica",
  },
  spellcheck: {
    endpoint: "spellcheck",
    input: "unitstateofamerica",
  },
  tokenize: {
    endpoint: "tokenize",
    input: "unitstateofamerica",
  },
  wordbreak: {
    endpoint: "wordbreak",
    input: "unitstateofamerica",
  },
  word: {
    endpoint: "word",
    input: "state",
  },
  synonyms: {
    endpoint: "synonyms",
    input: "united",
  },
  // "suggestions": {
  //   endpoint: "suggestions",
  //   input: "helloworld"
  // },
  // "tlds": {
  //   endpoint: "tlds",
  //   input: "helloworld"
  // }
};

apis["spellcheck-tokenize"].output = {
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

// apis["suggestions"].output = {
//   status: "success",
//   code: 200,
//   data: {
//     string_original: "hellowrld",
//     tld: "com",
//     string: "hello world",
//     tlds: ["world", "fyi", "earth", "info", "global", "travel", "international", "us", "eco"],
//     domains: {
//       "tld": ["hellowrld .fyi", "hellowrld .earth", "hellowrld .info", "hellowrld .global"],
//       "name": [
//         "hola society .com",
//         "howdy .earth",
//         "well hello .world",
//         "shalom .travel",
//         "earth .eco",
//         "hello there .earth",
//         "society .space"
//       ],
//       "word hack": ["worlda .eco", "planet .io", "orbus .org"],
//       "phrase hack": ["get hellowrld .eco", "my hellowrld .app", "hellowrld online .com"]
//     }
//   }
// };

// apis["tlds"].output = {
//   suggestions: "This endpoint is not yet ready. Coming soon!"
// };
