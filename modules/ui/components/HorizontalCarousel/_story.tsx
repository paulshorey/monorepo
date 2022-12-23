import React from 'react';
import HorizontalCarousel from '.';
import useShowStorybookCode from '@techytools/ui/hooks/useShowStorybookCode';
import CenterChildrenY from '../CenterChildrenY';

const Story = (props) => {
  useShowStorybookCode();
  return (
    <HorizontalCarousel>
      <CenterChildrenY
        as="span"
        ss="padding:2rem;height:280px;"
        textcolor="accent"
      >
        Any type of content can be used as a slide.
      </CenterChildrenY>
      <CenterChildrenY
        as="code"
        ss="padding:2rem;height:280px;"
        textcolor="cta"
      >
        Slides don't even have to be the same type of HTML element.
      </CenterChildrenY>
      <CenterChildrenY
        as="h1"
        ss="padding:2rem;height:280px;"
        textcolor="light"
      >
        Elements can be different width!
      </CenterChildrenY>
      <span data-zoom="/photos/aboutus.jpg">
        <img
          height={280}
          width={280}
          src="https://besta.domains/photos/aboutus.jpg"
        />
      </span>
      <span data-zoom="/photos/desk-paul.jpg">
        <img
          height={280}
          width={280}
          src="https://besta.domains/photos/desk-paul.jpg"
        />
      </span>
      <span data-zoom="/photos/desk-samira.jpg">
        <img
          height={280}
          width={386}
          src="https://besta.domains/photos/desk-samira.jpg"
        />
      </span>
      <span data-zoom="/photos/city-samira-paul.jpg">
        <img
          height={280}
          width={334}
          src="https://besta.domains/photos/city-samira-paul.jpg"
        />
      </span>
      <span data-zoom="/photos/aboutus-utah-road.jpg">
        <img
          height={280}
          width={280}
          src="https://besta.domains/photos/aboutus-utah-road.jpg"
        />
      </span>
      <span data-zoom="/photos/about-paul-rocks.jpg">
        <img
          height={280}
          width={280}
          src="https://besta.domains/photos/about-paul-rocks.jpg"
        />
      </span>
    </HorizontalCarousel>
  );
};

export default Story;

export const code = `// No configuration needed. By default it will render at 100% width, with arrows.
<HorizontalCarousel>

  <CenterChildrenY
    as="span"
    ss="padding:2rem;height:280px;"
    textcolor="accent"
  >
    Any type of content can be used as a slide.
  </CenterChildrenY>
  <CenterChildrenY
    as="code"
    ss="padding:2rem;height:280px;"
    textcolor="cta"
  >
    Slides don't even have to be the same type of HTML element.
  </CenterChildrenY>
  <CenterChildrenY
    as="h1"
    ss="padding:2rem;height:280px;"
    textcolor="light"
  >
    Elements can be different width!
  </CenterChildrenY>

  <span data-zoom="/photos/aboutus.jpg">
    <img
      height={280}
      width={280}
      src="https://besta.domains/photos/aboutus.jpg"
    />
  </span>
  <span data-zoom="/photos/desk-paul.jpg">
    <img
      height={280}
      width={280}
      src="https://besta.domains/photos/desk-paul.jpg"
    />
  </span>

  ...

</HorizontalCarousel>`;
