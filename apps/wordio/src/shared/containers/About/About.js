import React from "react";
import Link from "next/link";
import Header from "src/wordio/components/Header";
import { AboutUs, ContactUsButton } from "./About.styled";
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/pro-solid-svg-icons";
import { faCalendarStar } from "@fortawesome/pro-regular-svg-icons";
import ImgCarousel from "src/shared/components/CarouselAbout";
import { withRouter } from "next/router";

const _ = () => <span style={{ width: "5px" }} />;

class AboutPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      popupActive: false,
    };
  }
  componentDidMount = async () => {
    // open popup after viewer sees the aboutus content
    if (this.props.open_contact) {
      setTimeout(this.openContact, 1000);
    }
  };
  openContact = () => {
    try {
      window.document.querySelector(".eapps-form-floating-button").click();
    } catch (e) {
      window.alert("Please contact: paul@besta.domains   +1.385.770.6789");
    }
  };
  render() {
    return (
      <>
        <Header standalone={true} />

        {/*
         * Page content
         */}
        <AboutUs className="content">
          <div className="before">
            <div className="titleWithButton">
              <h2>About us:</h2>
              <ContactUsButton
                className="ContactUsButton clickable"
                onClick={() => {
                  this.openContact();
                }}
              >
                Message us&thinsp;
                <FA icon={faCommentDots} className="" />
              </ContactUsButton>
            </div>
            <p>
              We are a husband and wife team based in Kansas City, MO (USA)&thinsp;👨🏼‍💻&thinsp;👩🏽‍💼&thinsp; Combining our talents we created the most reliable
              English language{" "}
              <Link href="/thesaurus?str=best" className="link">
                <a>thesaurus</a>
              </Link>{" "}
              for automated applications. Our thesaurus is culturally sensitive, modern and quirky. It is the backbone of our{" "}
              <Link href="/" className="link">
                <a>domain suggestion engine</a>
              </Link>
              .{" "}
            </p>
            <p>
              Paul built some advanced admin tools to automate content editing. Samira used these tools to edit countless words and phrases. This made it
              possible for us to rearrange words and generate new phrases without accidentally creating awkward or offensive phrases. We're now utilizing this
              technology to generate domain name suggestions which otherwise only a human would have thought of.
            </p>
            <ImgCarousel />
          </div>
          <p>
            <b>Paul Shorey</b> (
            <a className="link" href="https://paulshorey.com" target="_blank">
              paulshorey.com
            </a>
            ) has been making websites and apps for 12 years. Finally getting pretty good at it. :) JavaScript, UI design, front-end, back-end, systems and
            databases. Paul has a BFA in fine art, but has embraced software development as his medium of choice. Programming is creative, and very powerful.
            It's also fun. When not coding, he enjoys building light fixtures, growing micro-greens, and doing adventure sports like{" "}
            <span className="nowrap">hang-gliding</span>.
          </p>
          <p>
            <b>Samira Shorey</b> holds a Bachelor in Sociology. She speaks Swahili and Mandarin, can read/write Arabic, and is currently learning Spanish.
            Samira’s previous roles have ranged from social media coordinator, graphic designer, researcher, and an electronic health records consultant. She
            has been a part of several non-profits around Kansas City and has also spearheaded her own initiatives. Samira is passionate about human centered
            design. She believes applications should be built with diversity of culture, brains and bodies in mind.
          </p>
          <p>
            <span
              onClick={() => {
                this.openContact();
              }}
            >
              <span className="link">Lets schedule a time to meet</span>&nbsp;
              <span className="link">
                <FA icon={faCalendarStar} className="" />
              </span>
            </span>
          </p>
          <div className="before">
            <div className="titleWithButton">
              <h2>This is all a work in progress...</h2>
            </div>
            <p>We are still tweaking the thesaurus and domain suggestions engine. Paul is busy improving the algorithms and inventing more nifty tools.</p>
          </div>
          <div className="after">
            <p>
              <b>We're looking forward to working with mentors, partners, and data science interns.</b>
            </p>
            <p>
              <a className="link" href="https://besta.domains" target="_blank">
                Besta.domains
              </a>{" "}
              -- We are now finishing the{" "}
              <a target="_blank" href="https://documenter.getpostman.com/view/23360867/2s8YzXtewC" className="link">
                domain suggestions API
              </a>{" "}
              for registrars, and making an app for consumers.
            </p>
            <p>
              <a className="link" href="https://wordio.co" target="_blank">
                Wordio
                <_ />
                .co
              </a>{" "}
              -- Planning to publish our thesaurus content as an API - for AI and text analysis applications
            </p>
            <p>
              Also coming soon, more text-analysis and web APIs. We'll publish each one as soon as it is tested and proven the most reliable in the industry.
              <ul>
                <li>
                  Our chunking/word-breaking algorithm is already in use in our domain suggestions - it lets us parse strings of characters with no spaces into
                  separate words, reliably every time.
                </li>
                <li>
                  Our sentiment analysis is currently very accurate for individual words and very short phrases - better than big AI companies. However, to
                  reliably support longer texts it will need much more development.
                </li>
                <li>Content extraction from large documents, saved to a database</li>
                <li>Entity extraction - to detect dates, links, and locations from a text</li>
                <li>Bot and web crawler prevention</li>
                <li>More domain tools, like WHOIS, site usage, expiring domains search</li>
              </ul>
            </p>
          </div>
          <div className="after">
            <p>
              <b>Let’s work together! </b> After wrapping up our current APIs, our plans are to gather new experiences and ideas, while meeting new partners and
              building relationships. If you are doing something interesting, we’d love to hear about it and meet.
            </p>
            <p>
              Please{" "}
              <b className="link clickable" onClick={this.openContact}>
                contact us
              </b>
              . Please give us your first impression of the site, suggestions, or thesaurus. Try out our product. It's still a work in progress, so please reach
              out if anything in particular stands out. Thank you for your visit and support! Hope to meet you soon.
            </p>
          </div>
          <div className="after">
            <ContactUsButton
              className="ContactUsButton clickable"
              onClick={() => {
                this.openContact();
              }}
            >
              Message us&thinsp;
              <FA icon={faCommentDots} className="" />
            </ContactUsButton>
          </div>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
        </AboutUs>
      </>
    );
  }
}
export default withRouter(AboutPage);
