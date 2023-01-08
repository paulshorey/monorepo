import React from "react";
import { CarouselStyled } from "./DomainsExamples.styled.js";
import Image from "next/image";
import HorizontalCarousel from "@techytools/ui/components/HorizontalCarousel";
import { faAngleLeft } from "@fortawesome/pro-light-svg-icons/faAngleLeft";
import { faAngleRight } from "@fortawesome/pro-light-svg-icons/faAngleRight";
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";

const CompareSlide = function ({ domain }) {
  return (
    <div className="slide">
      <div className="top browser">
        <div className="mock-title ours">
          <u>
            <span>"</span>
            <b>{domain}</b>
            <span>" is not available...</span>
          </u>
        </div>
        <Image src={"/examples/n_ours/" + domain + ".png"} alt={`${domain} screenshot`} width={400} height={976.2} className="ours" loading="lazy" />
      </div>
    </div>
  );
};

class DomainsExamples extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Slides: [
        <CompareSlide domain="helloworld.com" key="helloworld.com" />,
        <CompareSlide domain="pizza.party" key="pizza.party" />,
        <CompareSlide domain="idea.co" key="idea.co" />,
        <CompareSlide domain="getaway.com" key="getaway.com" />,
        <CompareSlide domain="cbdtonic.com" key="cbdtonic.com" />,
      ],
      isMounted: false,
    };
    this.carouselRef = React.createRef();
  }
  componentDidMount() {
    this.setState({
      isMounted: true,
    });
    setTimeout(() => {
      if (!this.state.isMounted) return;
      this.setState({
        Slides: [
          <CompareSlide domain="helloworld.com" key="helloworld.com" />,
          <CompareSlide domain="pizza.party" key="pizza.party" />,
          <CompareSlide domain="idea.co" key="idea.co" />,
          <CompareSlide domain="getaway.com" key="getaway.com" />,
          <CompareSlide domain="cbdtonic.com" key="cbdtonic.com" />,
          <CompareSlide domain="doyogaonline.com" key="doyogaonline.com" />,
          <CompareSlide domain="eatin.com" key="eatin.com" />,
          <CompareSlide domain="covidnews.com" key="covidnews.com" />,
          <CompareSlide domain="friendfinder.com" key="friendfinder.com" />,
          <CompareSlide domain="getfoodnow.com" key="getfoodnow.com" />,
          <CompareSlide domain="example.com" key="example.com" />,
          <CompareSlide domain="fitness.com" key="fitness.com" />,
          <CompareSlide domain="nonsense.com" key="nonsense.com" />,
          <CompareSlide domain="onehundred.com" key="onehundred.com" />,
          <CompareSlide domain="simplesolutions.com" key="simplesolutions.com" />,
          <CompareSlide domain="moneymatters.com" key="moneymatters.com" />,
          <CompareSlide domain="whatever.com" key="whatever.com" />,
          <CompareSlide domain="bubbagump.com" key="bubbagump.com" />,
          <CompareSlide domain="curryhouse.com" key="curryhouse.co" />,
        ],
      });
    }, 3000);
  }
  componentWillUnmount() {
    /*
     * For setTimeout, keep track if is mounted or not
     */
    if (this.state.isMounted) {
      this.setState({
        isMounted: false,
      });
    }
  }
  render() {
    if (!this.state.Slides) return null;
    return (
      <CarouselStyled>
        <HorizontalCarousel>
          <div className="slides">{this.state.Slides}</div>
          <div className="arrows top">
            <span className="arrow arrow-left prev">
              <FA icon={faAngleLeft} className="" />
            </span>
            <span className="arrow arrow-right next">
              <FA icon={faAngleRight} className="" />
            </span>
          </div>
        </HorizontalCarousel>
      </CarouselStyled>
    );
  }
}
export default DomainsExamples;
