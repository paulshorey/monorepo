import Block from '@techytools/ui/components/Block';
import Link from '@techytools/ui/components/Link';
import { css } from '@emotion/react';

const style = ({ theme }) => css`
  max-width: 428px;
  width: 100vw;
  background: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1),
    transparent,
    rgba(255, 255, 255, 0.1)
  );
  padding: 0.5rem 1.5rem;
  display: inline-block;
  border-radius: 1rem;
  border: solid 1px rgba(255, 255, 255, 0.33);
  cursor: pointer;
  background-position: left center;

  &:hover,
  &:focus:not(:hover) {
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.1),
      transparent,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.2),
      rgba(255, 255, 255, 0.1),
      transparent,
      rgba(255, 255, 255, 0.1)
    );
    border: solid 1px rgba(255, 255, 255, 0.67);
    background-size: 300% auto;
    transition: background-position 500ms linear 0s,
      background-size 500ms linear 0s;
    background-position: right center;
  }

  h2 {
    margin-bottom: 0;
    line-height: 1;
  }

  label: ssLatestProjectsCarousel;
`;

const LatestProjectsCarousel = ({ slide }) => {
  if (!slide) {
    return null;
  }
  const { title, subtitle, href } = slide;
  return (
    <Link href={href} target="_blank" ss="display:inline-block;">
      <Block data-bgcolor="transparentCard" ss={style}>
        <Block data-textcolor="rainbow" data-textgradient>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </Block>
      </Block>
    </Link>
  );
};

export default LatestProjectsCarousel;
