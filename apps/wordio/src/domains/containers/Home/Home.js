import React from "react";
import { HomeStyled } from "./Home.styled";
import Search from "src/shared/components/Search";
import ExamplesCarousel from "src/shared/components/Carousels/DomainsExamples";
import Head from "next/head";
import Link from "next/link";
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/pro-regular-svg-icons/faArrowDown";
import { faCommentDots } from "@fortawesome/pro-regular-svg-icons/faCommentDots";
import { faHeart } from "@fortawesome/pro-regular-svg-icons/faHeart";
import { ContactUsButton } from "src/shared/containers/About/About.styled";
// import Results from "../Results";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as rx_io_actions from "src/shared/redux/actions/io";
import * as rx_ui_actions from "src/shared/redux/actions/ui";
import { withRouter } from "next/router";

// import { StyledHome } from "../../../shared/containers/Word/WordHome.styled"

class Home extends React.Component {
  componentDidMount() {
    this.props.rx_io_actions.RX__clear_inputs();
  }

  async componentDidUpdate(prevProps) {
    /*
     * Get suggestions
     */
    if (this.props.search_now && this.props.search_now !== prevProps.search_now) {
      this.props.rx_io_actions.RX__search_suggestions();
    }
  }

  render() {
    return (
      <HomeStyled>
        <Head>
          <title>Domain suggestions</title>
        </Head>
        <a name="top"> </a>
        <Search
          autofocus={true}
          className={"Search Domains Home"}
          domains={true}
          home={true}
          title={[<div key="1">Find available domain names:</div>]}
          cue={[
            <span key="2" className="">
              ☝️ Use our AI to search thousands of related words and TLDs
            </span>
          ]}
        />
        <>
          <article className="container gradient">
            <div className="content">
              <a name="examples"> </a>
              <center>
                <h4 className="attention">
                  It's the best suggestions engine! Scroll down to read about how we created it.
                </h4>
                {/* <h2 className="attention">
                  Use our AI to find an available domain name{" "}
                  <sub className="nowrap">
                    (or to increase<span className="hide-small"> your</span> domain sales)!
                  </sub>
                </h2> */}
                {/* <p>
                  <FA icon={faArrowDown} className="color-accent" style={{ verticalAlign: "middle" }} /> Check out some
                  screenshots<span className="hide-small"> and read more about it</span>
                </p> */}
              </center>
            </div>
            <div className="carousel_section_container content widewidth">
              <ExamplesCarousel />
            </div>
            <div className=" content">
              <a className="compare-anchor" name="compare">
                {" "}
              </a>
              <p>
                <a
                  href="#top"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('[name="top"]').scrollIntoView({
                      behavior: "smooth"
                    });
                  }}
                >
                  Try it
                </a>{" "}
                ☝️.{" "}
                <span className="link nowrap" onClick={this.props.rx_ui_actions.open_contact_form}>
                  Please let us know what you think of it so far!
                </span>{" "}
                🙏 👨🏼‍💻 👩🏽‍💼 <Link href="/about">About us</Link>
              </p>
              <p>
                We have put a lot of effort into creating the finest{" "}
                <a href="https://wordio.co" target="_blank">
                  thesaurus
                </a>{" "}
                and text-analysis algorithms.{" "}
              </p>
              <p>
                The examples above prioritize <b>nTLDs</b>. We specialize in finding relevant <b>nTLDs</b>. Example: for
                search term "food", we'd suggest <b>.recipes</b>, <b>.menu</b>, <b>.cafe</b>. You may configure your API
                settings to prioritize <b>gTLDs</b> or <b>ccTLDs</b> like <b>.net</b>,<b>.biz</b>, <b>.io</b>,{" "}
                <b>.ly</b>, or any TLDs which you wish to promote.{" "}
              </p>
              <br />
              <div className="p">
                <b>Our engine uses new proprietary technology:</b>
                <ul>
                  <li>the most complete and powerful custom database of English words and phrases.</li>
                  <li>sentiment-analysis, to never offend anyone.</li>
                </ul>
                <b className="highlighted">So, we're able to:</b>
                <ul>
                  <li>pick out the most relevant TLDs out of thousands, reliably every time!</li>
                  <li className="highlighted">
                    be playful and creative with our suggestions, without fear of creating a cringeworthy phrase.
                  </li>
                  <li>draw from a vast pool of words and phrases, and come up with natural sounding suggestions.</li>
                </ul>
              </div>
              <p>
                <br />
                <b className="underlined">Our suggestions are improving every day!</b> We're adding logic and content
                for more clever and reliable results. The app is currently slow (development mode). Certain queries may
                not give perfect results yet (we're still testing all possible cases). Still adding pop-culture terms,
                slang, names, brands, before/after, etc.{" "}
                <span className="link" onClick={this.props.rx_ui_actions.open_contact_form}>
                  Please let us know what worked for you and what didn't.
                </span>{" "}
                <span className="link nowrap" onClick={this.props.rx_ui_actions.open_contact_form}>
                  Let us know what features are important to you.
                </span>
              </p>
            </div>

            <div className="content">
              <a name="features" />
              <ul className="article_ul">
                <li className="article_li">
                  <h2 className="">How we do it:</h2>
                </li>

                <li className="article_li">
                  <h4 className="hinted">
                    Our Proprietary Thesaurus Database (
                    <a href="https://wordio.co" target="_blank">
                      Wordio.co
                    </a>
                    )
                  </h4>
                  <a name="sentiment-analysis" />
                  <p>
                    We meticulously compiled and edited the best English language thesaurus of 330,000+ words, including
                    some short phrases and foreign words. A corpus of 10,000,000+ words, Wordio contains 2.5x more
                    entries than Oxford or Thesaurus.com. Our synonyms are conversational, positive, and short.
                  </p>
                </li>
                <li className="article_li">
                  <h4 className="hinted">Sentiment Analysis AI</h4>
                  <p>
                    Language can be riddled with negative connotations that hold ethnocentric, biased, or insensitive
                    meaning.
                  </p>
                  <p>
                    Take “black” for example. A thesaurus will often give negative suggestions such as “dirty” or
                    “evil”. Other problematic words were “woman”, “girl”, and proper nouns like “Nike” or “Asian”. We
                    took care of many of these issues, manually and programmatically, then thoroughly tested.
                  </p>
                  <a name="tlds" />
                  <p>
                    We now have the most accurate sentiment analysis algorithm that leaves only positive, clean,
                    culturally appropriate synonyms. We are passionate about an inclusive internet for everyone{" "}
                    <FA icon={faHeart} className="x85" />.{" "}
                  </p>
                </li>

                <li className="article_li">
                  <h4 className="hinted">All The TLDs</h4>
                  <p>
                    Most visitors are not aware of all the new TLDs like “.casa” for home-related or “.law” for legal
                    topics. Your visitors are missing out on great domain names. You are missing out on domain sales and
                    recurring customers.
                  </p>

                  <p>
                    newTLDs + genericTLDs = we find all the relevant and meaningful extensions related to the visitor’s
                    search term, sorted by relevance.
                  </p>

                  <p>
                    ccTLDs = we know that “.ai” means Artificial Intelligence, “.io” is used by tech startups, etc.
                    We’ll treat these the same as nTLDs and gTLDs - detect their meaning, and include when relevant and
                    meaningful according to your rating. But also, we'll use any TLD to create a word hack - we'll
                    suggest "lighti.ng" if "lighting.com" is not available.{" "}
                  </p>
                </li>

                <li className="article_li">
                  <h4 className="hinted">You control which TLDs to use, and which to promote!</h4>

                  <p>
                    You can give each TLD a rating, based on how highly you want to promote it. Highly rated TLDs will
                    float to the top of suggestion results.Low rated TLDs will float to the bottom and won't be used as
                    often. But regardless of the rating, we will ONLY use the TLDs which are relevant to the user's
                    search term.{" "}
                  </p>
                </li>

                <li className="article_li">
                  <h4 className="hinted">Word Hacks / Domain hacks</h4>
                  <p>
                    Our algorithm finds creative word and domain hacks - like turning "panorama.com" into
                    "panoramio.com", "panoram.io", "pictur.es", "panoramica.com", "panorami.ca", "photographio.com", or
                    "photograph.io".
                  </p>
                </li>

                <li className="article_li">
                  <h4 className="hinted">Markov Strings</h4>
                  <p>We have developed some clever algorithms, to arrange words in unique but meaningful ways.</p>
                  <p>
                    Markov strings are combinations like "adjective -&gt; noun". Simple ones like this are just
                    scratching the surface of NLP (Natural Language Processing), but we already use them to create fun
                    and catchy 2-3 word phrases. We are actively expanding our linguistic capabilities.
                  </p>
                </li>

                <li className="article_li">
                  <h4 className="hinted">Spell check</h4>
                  <p>
                    If your visitor types in a misspelled phrase like "aplesandoranges.com". Even if the user meant to
                    misspell the name, like for a brand name, it's still useful to figure out the underlying meaning, to
                    match the most relevant TLDs.
                  </p>
                </li>

                <li className="article_li">
                  <h4 className="hinted">Reliable parsing + word breaking</h4>
                  <p>
                    User may search "multiworddomainname.com". We parse it into individual words, and extract meaning
                    from each: "multi", "word", "domain", "name".
                  </p>
                </li>

                <li className="article_li">
                  <h4 className="hinted">Brand, name, and entity extraction</h4>
                  <p>
                    We can determine if a word or phrase mentions a person's name, a brand, or any other proper noun.
                    Still working on improving the accuracy, but already very useful. Our suggestions algorithm can then
                    say{" "}
                    <span className="nowrap">
                      "hello {"{"}Name{"}"}"
                    </span>{" "}
                    or{" "}
                    <span className="nowrap">
                      "get {"{"}Brand{"}"}",
                    </span>{" "}
                    and perform other logic and optimizations, and suggest more relevant TLDs.
                  </p>
                </li>

                <li className="article_li">
                  <h4 className="hinted">Before/After</h4>
                  <p>
                    We already utilize the open-source DataMuse API to suggest words that naturally come before the
                    user's search term.
                  </p>
                  <p>
                    We are currently expanding this functionality. We're working on collecting data from public articles
                    around the internet, and evaluating the most likely before/after words and phrases, for even better
                    suggestions! <span className="underlined"> Combined with our linguistic software, </span> this will
                    be an impressive feature!
                  </p>
                </li>

                <li className="article_li">
                  <h4 className="hinted">Enterprise Ready</h4>
                  <p>
                    For smaller clients, or just to test our service, our APIs are available instantly with no contract,
                    on{" "}
                    <a target="_blank" href="https://documenter.getpostman.com/view/23360867/2s8YzXtewC">
                      RapidAPI.com
                    </a>
                    .
                  </p>
                  <p>
                    Once you're ready, you may sign a contract with with us, and access our servers directly, at a
                    discounted rate. To further increase performance, we will spawn new web servers as close as possible
                    to your data centers (or customers, if you send API requests from the client). We'll work with you
                    to make anything possible.
                  </p>
                  <p>
                    You can even host our API on your own server to avoid sending any web requests. Get your results
                    instantly. This option would require an unlimited license, and some custom development. Ask us about
                    this or any other feature you'd like to see.
                  </p>
                </li>
              </ul>

              <h3 className="attention">Let's talk business. Let's talk tech.</h3>
              <p>
                <b className="underlined">This product is still improving every day.</b> We're currently working hard on
                new features, even better results, and powerful sorting and filtering options. Tell us what's important
                to you. We can make it happen!{" "}
              </p>
              <p>
                The API is now available at{" "}
                <a target="_blank" href="https://documenter.getpostman.com/view/23360867/2s8YzXtewC">
                  <b>RapidAPI</b>
                </a>
                . We're currently optimizing our code and servers for production and scale. We're rolling out a globally
                distributed cloud infrastructure - for fast responses anywhere in the world. Soon, you'll be able to
                query our servers, without going through RapidAPI, or even host on your own server.
              </p>
              <p>
                <span>We are now beginning to collaborate with interested registrars. </span>
                <b>We see this becoming the new standard in domain search results. </b>
                <span>Increase your market share. Gain more recurring customers. Increase your domain sales.</span>
              </p>
              <p className="with_button">
                <ContactUsButton
                  className="ContactUsButton clickable"
                  onClick={this.props.rx_ui_actions.open_contact_form}
                >
                  Contact us <FA icon={faCommentDots} className="" />
                </ContactUsButton>
                {/*&emsp;Let's discuss integration, features, timeline...{" "}*/}
                <span className="nowrap">
                  We have 12 years of experience in web development. We can help you query our data on your site.
                </span>
              </p>
              <br />

              <h3>Beat your competition</h3>
              <p>
                You can be one of the first in the industry to use this tool. We can even develop some custom features
                for you.
              </p>
              <p>
                These suggestions are already much better than anything out there, using these results, you will improve
                your UI, earn more recurring customers, and increase market share.
              </p>
              <p>
                We imagine that the bigger registrars may insist on an exclusive contract. Hurry up and get yours before
                it's too late!
              </p>
              <p>
                <b>
                  <span className="underlined">
                    Our data and algorithms are improving every day! We're still adding features, editing, and testing.
                  </span>{" "}
                  Please let us know what worked for you, and what didn't.{" "}
                  <span className="link nowrap" onClick={this.props.rx_ui_actions.open_contact_form}>
                    Please let us know what features you'd like to see!
                  </span>
                </b>
              </p>
              <br />

              <h3>Easy to integrate...</h3>
              <p>
                Our API uses modern standards (JSON/REST). It is very easy to use. See our{" "}
                <a target="_blank" href="https://documenter.getpostman.com/view/23360867/2s8YzXtewC">
                  API documentation
                </a>
                . Tutorials and example code coming very soon.
              </p>
              <p>
                If you need help with integration, we have <b>12 years experience</b> in web development and UI design.
                Let's do it together!
              </p>
              <br />

              <h3>Contact us :)</h3>
              <p>
                We are a <b>USA team</b> of husband and wife, available to meet anytime.{" "}
                <a href="/about" target="_blank" className="nowrap link">
                  About us<span style={{ fontSize: "1.05em" }}>&nbsp;👨🏼‍💻&thinsp;👩🏽‍💼</span>
                </a>
              </p>
              <p>
                We're currently fine-tuning and optimizing the product and platform, but the API is already available
                for testing and integration at{" "}
                <a target="_blank" href="https://documenter.getpostman.com/view/23360867/2s8YzXtewC">
                  RapidAPI
                </a>
                . It will be available for production and scale very soon.
              </p>
              <p className="with_button">
                <ContactUsButton
                  className="ContactUsButton clickable"
                  onClick={this.props.rx_ui_actions.open_contact_form}
                >
                  Let's chat <FA icon={faCommentDots} className="" />
                </ContactUsButton>
                Learn more about us. Ask us anything.
                <span className="hr" />
              </p>

              <br />
            </div>
          </article>
        </>
      </HomeStyled>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    rx_ui_actions: bindActionCreators(rx_ui_actions, dispatch),
    rx_io_actions: bindActionCreators(rx_io_actions, dispatch)
  };
};

const mapStateToProps = function (state) {
  return {
    search_now: state.input.search_now,
    input_str: state.input.str
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Home));
