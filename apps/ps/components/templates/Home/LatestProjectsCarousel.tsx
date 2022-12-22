import { Fragment } from 'react';
import HorizontalCarousel from '@ps/ui/components/HorizontalCarousel';
import { css } from '@emotion/react';
import FeatureSlide from './FeatureSlide';

const style = ({ theme }) => css`
  margin: 2rem 0 0;
  img {
    height: 15rem;
  }
  .__prev,
  .__next {
    color: white !important;
    opacity: 0.55;
    max-height: 100% !important;
    visibility: visible !important;
    height: 90% !important;
    top: 5% !important;
    position: absolute !important;
    display: block !important;
    transform: scale(1, 1.25) !important;
    ${theme.mq.sm} {
      height: 80% !important;
      top: 10% !important;
    }
  }
  .__prev {
    padding: 2rem 3rem 2rem 1rem;
    left: 0;
  }
  .__next {
    padding: 2rem 1rem 2rem 3rem;
    right: 0;
  }
  .__prev:hover,
  .__next:hover {
    opacity: 0.85;
  }
`;
const slides = [
  {
    title: 'Harmony UI',
    subtitle: (
      <Fragment>
        Component library and styling system{' '}
        <span className="noWrap">for mono-repo front ends</span>
      </Fragment>
    ),
    href: 'https://ui.paulshorey.com',
  },
  {
    title: 'Harmony Fn',
    subtitle: (
      <Fragment>
        Universal (NodeJS and browser){' '}
        <span className="noWrap">library of utility functions</span>
      </Fragment>
    ),
    href: 'https://fn.paulshorey.com',
  },
  {
    title: 'Responsive development',
    subtitle: (
      <Fragment>
        Preview a website{' '}
        <div className="noWrap">on multiple different sizes</div>
      </Fragment>
    ),
    href: 'https://responsive.paulshorey.com',
  },
  {
    title: 'Colorful Cloud Logger',
    subtitle: (
      <Fragment>
        Universal (NodeJS and browser){' '}
        <span className="noWrap">console logging solution</span>
      </Fragment>
    ),
    href: 'https://github.com/paulshorey/colorful-console-logger',
  },
  {
    title: 'Besta.domains',
    subtitle: (
      <Fragment>
        Find the "best available domain names"{' '}
        <span className="noWrap">for your business</span>
      </Fragment>
    ),
    href: 'https://besta.domains',
  },
  {
    title: 'Wordio.co',
    subtitle: (
      <Fragment>
        Thesaurus API with sentiment analysis{' '}
        <span className="noWrap">for natural language processing</span>
      </Fragment>
    ),
    href: 'https://wordio.co',
  },
];

const LatestProjectsCarousel = () => {
  return (
    <Fragment>
      <HorizontalCarousel ss={style}>
        {slides.map((slide, i) => (
          <FeatureSlide slide={slide} key={i} />
        ))}
      </HorizontalCarousel>
    </Fragment>
  );
};

export default LatestProjectsCarousel;
