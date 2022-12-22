import React from 'react';
import styled from '@emotion/styled';
// import Icon from '@atoms/Icon';

class Wordio extends React.Component {
  render() {
    return (
      <WordioStyled className="content">
        <article>
          {/* <a name="besta" id="besta" className="a_target" /> */}

          <h3>
            2021 - Making sites and apps to make the world a better place, at:{' '}
            <a href="https://spiral.us" target="_blank" rel="noreferrer">
              Spiral Financial
            </a>{' '}
            {/* <Icon type='fak' icon='spiralHeart' /> */}
          </h3>
        </article>

        <article>
          {/* <a name="besta" id="besta" className="a_target" /> */}

          <h3>2020 - Built text-analysis apps and APIs:</h3>
          <div className="description">
            <p>
              <b className="titleFont">
                <a
                  href="https://besta.domains"
                  target="_blank"
                  rel="noreferrer"
                >
                  Besta.domains
                </a>{' '}
                {/* <code className="color-medium vrsn">beta</code>{" "}*/}
              </b>
              - The best domain name suggestions. App and API. It doesn't just
              search, but actually generates new phrases using Natural Language
              Processing! Also check availability of 100s of names at a time.
              Load balanced cloud of 10 servers returns results x10 faster. The
              front-end is optimized to check only the results which are in
              view.{' '}
              {/* For this I created a load-balancer of 10 cloud servers. When you make a call to the API, it distributes the 100s of domains evenly accross the servers, for x10 faster response.&nbsp;*/}
              <span className="nowrap hide-small">
                API documentation:{' '}
                <a
                  href="https://besta.domains/api"
                  target="_blank"
                  rel="noreferrer"
                >
                  besta.domains/api
                </a>
                .
              </span>
              {/* <span className="nowrap">*/}
              {/*  <span className="hide-small">*/}
              {/*    Get the APIs at{" "}*/}
              {/*    <a href="https://rapidapi.com/besta-domains/api/domain-suggestions-tlds" target="_blank">*/}
              {/*      rapidapi.com*/}
              {/*    </a>*/}
              {/*    .&nbsp;*/}
              {/*  </span>*/}
              {/*  <span className="nowrap hide-small">*/}
              {/*    Documentation:{" "}*/}
              {/*    <a href="https://besta.domains/api" target="_blank">*/}
              {/*      besta.domains/api*/}
              {/*    </a>*/}
              {/*    .&nbsp;*/}
              {/*  </span>*/}
              {/*  /!*<span className="hide-large">*!/*/}
              {/*  /!*  Demo:{" "}*!/*/}
              {/*  /!*  <a href="https://besta.domains" target="_blank">*!/*/}
              {/*  /!*    besta.domains*!/*/}
              {/*  /!*  </a>*!/*/}
              {/*  /!*  .*!/*/}
              {/*  /!*</span>*!/*/}
              {/* </span>*/}
            </p>

            <div className="horizontal_carousel lightbox">
              <div className="slides">
                <a
                  href="/screenshots/domains/domains.png"
                  data-title="&nbsp;&nbsp; https://besta.domains - app to help you find available domain names &nbsp;&nbsp;"
                >
                  <img
                    loading="lazy"
                    src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/domains/_thumb-domains.webp"
                  />
                </a>
                <a
                  href="/screenshots/domains/domain_wordbreak.png"
                  data-title="&nbsp;&nbsp; Using my own linguistic tools to do word breaking / lemmatization / tokenization &nbsp;&nbsp;"
                >
                  <img
                    loading="lazy"
                    src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/domains/_thumb-domain_wordbreak.webp"
                  />
                </a>
                <a
                  href="/screenshots/domains/domain_wip.png"
                  data-title="&nbsp;&nbsp; This app (API) actually generates new phrases similar to your search term. See some code samples below. &nbsp;&nbsp;"
                >
                  <img
                    loading="lazy"
                    src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/domains/_thumb-domain_wip.webp"
                  />
                </a>
                <a
                  href="/screenshots/domains/domain_edit.png"
                  data-title="&nbsp;&nbsp; Admin tool: to suggest relevant TLDs, we find related words of each TLD (.app, .haus, .red, .cat, .accountant) &nbsp;&nbsp;"
                >
                  <img
                    loading="lazy"
                    src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/domains/_thumb-domain_edit.webp"
                  />
                </a>
                <a
                  href="/screenshots/domains/domains_all_edit.png"
                  data-title="&nbsp;&nbsp; Admin tool: look through each TLD, and find any that need more synonyms. &nbsp;&nbsp;"
                >
                  <img
                    loading="lazy"
                    src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/domains/_thumb-domains_all_edit.webp"
                  />
                </a>
                <a
                  href="/screenshots/domains/word_view.png"
                  data-title="&nbsp;&nbsp; https://wordio.co - thesaurus app (demo to browse our database) &nbsp;&nbsp;"
                >
                  <img
                    loading="lazy"
                    src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/domains/_thumb-word_view.webp"
                  />
                </a>
                <a
                  href="/screenshots/domains/word_edit.png"
                  data-title="&nbsp;&nbsp; Admin tool: edit the word - parts of speech, sentiment, synonyms, abbreviations, etc. &nbsp;&nbsp;"
                >
                  <img
                    loading="lazy"
                    src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/domains/_thumb-word_edit.webp"
                  />
                </a>
                <a
                  href="/screenshots/domains/api_docs.png"
                  data-title="&nbsp;&nbsp; Learn about endpoints, inputs, outputs, links to subscribe and to test in sandbox. &nbsp;&nbsp;"
                >
                  <img
                    loading="lazy"
                    src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/domains/_thumb-api_docs.webp"
                  />
                </a>
              </div>
            </div>
          </div>

          <div className="description">
            <p>
              <b className="titleFont">
                <a href="https://wordio.co" target="_blank" rel="noreferrer">
                  Wordio.co
                </a>{' '}
                {/* <code className="color-medium vrsn">alpha</code>{" "}*/}
              </b>
              - Wrote some linguistic APIs and algorithms, for AI, writing, or
              search applications. Compiled and edited a thesaurus of 300,000+
              words. Find the root-word, parts-of-speech, sentiment analysis,
              abbreviations, contractions, singular/plural, etc. Get synonyms
              and related words, organized by sentiment. Word-breaking,
              tokenization, lemmatization and spellcheck on text inputs without
              spaces.
              {/* Please contact me for a demo.*/}
              {/* Created some nifty open-source scripts{" "}*/}
              {/* <span*/}
              {/*  className="link"*/}
              {/*  onClick={() => {*/}
              {/*    let el = document.querySelector("#open_source")*/}
              {/*    !!el &&*/}
              {/*      el.scrollIntoView({*/}
              {/*        behavior: "smooth"*/}
              {/*      })*/}
              {/*  }}*/}
              {/* >*/}
              {/*  below*/}
              {/* </span>*/}
              {/* , to help perform data manipulation in JavaScript.*/}
              {/* APIs are currently private.*/}
              {/* Demo:{" "}*/}
              {/* <a href="https://wordio.co" target="_blank">*/}
              {/*  wordio.co*/}
              {/* </a>*/}
            </p>

            <div className="horizontal_carousel lightbox" id="code_samples">
              <div className="slides">
                <a
                  href="/screenshots/domains/wordio-co.png"
                  data-title="&nbsp;&nbsp; https://wordio.co - API explorer. Test out the data without signing up for anything. &nbsp;&nbsp;"
                >
                  <img
                    loading="lazy"
                    src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/domains/_thumb-wordio-co.webp"
                  />
                </a>
                <a
                  href="/screenshots/domains-code/nlp-be-api.png"
                  data-title="&nbsp;&nbsp; Node.js Express API - each endpoint in its own folder - helper code in ES Modules &nbsp;&nbsp;"
                >
                  <img
                    loading="lazy"
                    src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/domains-code/_thumb-nlp-be-api.webp"
                  />
                </a>
                <a
                  href="/screenshots/domains-code/nlp-be-markov-strings.png"
                  data-title="&nbsp;&nbsp; Combining pairs of complementary words (from synonyms/derivations) to make a simple phrase (like adjective->noun) &nbsp;&nbsp;"
                >
                  <img
                    loading="lazy"
                    src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/domains-code/_thumb-nlp-be-markov-strings.webp"
                  />
                </a>
                <a
                  href="/screenshots/domains-code/nlp-be-add_original.png"
                  data-title="&nbsp;&nbsp; Makes a matrix data structure from an array, then finds all possibilities and saves as a flat list &nbsp;&nbsp;"
                >
                  <img
                    loading="lazy"
                    src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/domains-code/_thumb-nlp-be-add_original.webp"
                  />
                </a>
                <a
                  href="/screenshots/domains-code/nlp-be-domains_lists.png"
                  data-title="&nbsp;&nbsp; Domain suggestions created in a dictionary of collections. Converted to list. Rated. Sorted. &nbsp;&nbsp;"
                >
                  <img
                    loading="lazy"
                    src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/domains-code/_thumb-nlp-be-domains_lists.webp"
                  />
                </a>
                <a
                  href="/screenshots/domains-code/nlp-fe-Dom.png"
                  data-title="&nbsp;&nbsp; Render each domain suggestion result - find status code (available/premium/etc). &nbsp;&nbsp;"
                >
                  <img
                    loading="lazy"
                    src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/domains-code/_thumb-nlp-fe-Dom.webp"
                  />
                </a>
                <a
                  href="/screenshots/domains-code/nlp-fe-Doms.styled.png"
                  data-title="&nbsp;&nbsp; Styled-components are awesome! Classic SCSS format, but use JavaScript variables and functions. Like this is_retina(). &nbsp;&nbsp;"
                >
                  <img
                    loading="lazy"
                    src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/domains-code/_thumb-nlp-fe-Doms.styled.webp"
                  />
                </a>
                <a
                  href="/screenshots/domains-code/nlp-fe-inputTld.png"
                  data-title="&nbsp;&nbsp; Besta.domains React front-end - Input text field (and Select dropdown) user interaction events. &nbsp;&nbsp;"
                >
                  <img
                    loading="lazy"
                    src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/domains-code/_thumb-nlp-fe-inputTld.webp"
                  />
                </a>
                <a
                  href="/screenshots/domains-code/npm-run-thumb.png"
                  data-title="&nbsp;&nbsp; Node script started by `npm run thumb` - makes a small thumbnail copy of all images in specified path (recursively). &nbsp;&nbsp;"
                >
                  <img
                    loading="lazy"
                    src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/domains-code/_thumb-npm-run-thumb.webp"
                  />
                </a>
              </div>
            </div>
          </div>
        </article>
      </WordioStyled>
    );
  }
}

export default Wordio;

const WordioStyled = styled.div`
  margin-top: 1.75rem;
  margin-bottom: 3.5rem;

  .description {
    border-bottom: solid 1px #efefef;

    &:last-child {
      border: none;
    }

    > div {
      margin: 1rem 0 0.75rem 0;
    }
  }

  .vrsn {
    zoom: 0.9;
    position: relative;
    top: -0.1rem;
  }
`;
