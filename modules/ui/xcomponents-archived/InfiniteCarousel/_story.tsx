import React from 'react';
import Block from '@ps/ui/components/Block';
import InfiniteCarousel from '.';
import useShowStorybookCode from '@ps/ui/hooks/useShowStorybookCode';
import CenterChildrenY from '@ps/ui/components/CenterChildrenY';

const Story = (props) => {
  useShowStorybookCode();
  return (
    <Block variant="centered" textcolor="light">
      <InfiniteCarousel smallerDots={true} autoplaySpeed={10000}>
        <CenterChildrenY
          as="div"
          ss="padding:2rem;height:280px;"
          textcolor="accent"
        >
          This is the first slide.
          <h1>All slides in this slideshow are rendered the same width.</h1>
          But slides can show different types of content.
        </CenterChildrenY>
        <CenterChildrenY
          as="div"
          ss="padding:2rem;height:280px;"
          textcolor="accent"
        >
          This will look better if all slides have the same aspect ratio.
          Otherwise, taller content will be cut off, <br />
          <br />
          or overlay behind the dots/prev/next controls.
        </CenterChildrenY>
        <span data-zoom="/photos/aboutus.jpg">
          <img
            height={200}
            width={200}
            src="https://besta.domains/photos/aboutus.jpg"
          />
        </span>
        <span data-zoom="/photos/desk-paul.jpg">
          <img
            height={200}
            width={200}
            src="https://besta.domains/photos/desk-paul.jpg"
          />
        </span>
        <span data-zoom="/photos/desk-samira.jpg">
          <img
            height={200}
            width={386}
            src="https://besta.domains/photos/desk-samira.jpg"
          />
        </span>
        <span data-zoom="/photos/city-samira-paul.jpg">
          <img
            height={200}
            width={334}
            src="https://besta.domains/photos/city-samira-paul.jpg"
          />
        </span>
        <span data-zoom="/photos/aboutus-utah-road.jpg">
          <img
            height={200}
            width={200}
            src="https://besta.domains/photos/aboutus-utah-road.jpg"
          />
        </span>
        <span data-zoom="/photos/about-paul-rocks.jpg">
          <img
            height={200}
            width={200}
            src="https://besta.domains/photos/about-paul-rocks.jpg"
          />
        </span>
      </InfiniteCarousel>
    </Block>
  );
};

export default Story;

export const code = `<InfiniteCarousel smallerDots={true} autoplaySpeed={10000}>

  <CenterChildrenY
    as="div"
    ss="padding:2rem;height:280px;"
    textcolor="accent"
  >
    This is the first slide.
    <h1>All slides in this slideshow are the same width.</h1>
  </CenterChildrenY>

  <span data-zoom="/photos/aboutus.jpg">
    <img
      height={200}
      width={200}
      src="https://besta.domains/photos/aboutus.jpg"
    />
  </span>
  <span data-zoom="/photos/desk-paul.jpg">
    <img
      height={200}
      width={200}
      src="https://besta.domains/photos/desk-paul.jpg"
    />
  </span>
  <span data-zoom="/photos/desk-samira.jpg">
    <img
      height={200}
      width={386}
      src="https://besta.domains/photos/desk-samira.jpg"
    />
  </span>

</InfiniteCarousel>`;
