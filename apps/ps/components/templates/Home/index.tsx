import HCarousel from './AboutMeCarousel';
import Block from '@ps/ui/components/Block';
import LatestProjectsCarousel from './LatestProjectsCarousel';
import { css } from '@emotion/react';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import Link from '@ps/ui/components/Link';
import FlexHeader from './FlexHeader';

const style = (props) => css`
  height: 100vh;
  max-height: 1200px;
  ${props.theme.mq.tablet} {
    height: calc(100vh - 80px);
    max-height: 1000px;
  }
  ${props.theme.mq.phone} {
    height: calc(100vh - 120px);
    max-height: 800px;
    align-items: start;
  }
  p {
    letter-spacing: 0.1px;
    text-align: center;
  }
  @media (min-width: 400px) and (max-width: 427px) {
    .hideAwkwardPhoneSize {
      display: none;
    }
  }
`;

function Home() {
  return (
    <Block ss={style}>
      <FlexHeader />
      <Block as="p">
        <span className="hideAwkwardPhoneSize">Hi. </span>Thanks for visiting! I
        love learning and collaborating. Lets work together!{' '}
        <Link
          href="#"
          onClick={() => {
            const el = window.document.querySelector(
              '[class*="FloatingButton__FloatingButtonContainer"] button'
            );
            // @ts-ignore
            if (el && el.click) el.click();
          }}
        >
          Resume
        </Link>{' '}
        <FA icon={regular('download')} />
      </Block>
      <HCarousel />
      <Block>
        <Block
          as="p"
          ss="margin: 5rem 1.25rem 1.5rem;"
          ssPhone="margin-top: 3.5rem;"
        >
          Here are some of my recent experiments (full-stack mono-repo of apps,
          apis and dev-tools):
        </Block>
        <LatestProjectsCarousel />
      </Block>
    </Block>
  );
}
export default Home;
