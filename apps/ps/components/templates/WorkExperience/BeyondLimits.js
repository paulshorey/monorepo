import React from 'react';
import styled from '@emotion/styled';

const Section = function () {
  return (
    <BLStyled>
      <article className="beyond_limits">
        <h3 className="content featured">2018-2020 - Beyond Limits:</h3>
        <div className="content full horizontal_carousel lightbox">
          <div className="slides">
            <a href="/screenshots/bl/ist-1.png" data-title="">
              <img
                loading="lazy"
                src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/bl/_thumb-ist-1.webp"
              />
            </a>
            <a href="/screenshots/bl/aira-1.png" data-title="">
              <img
                loading="lazy"
                src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/bl/_thumb-aira-1.webp"
              />
            </a>
            <a href="/screenshots/bl/sm-1.png" data-title="">
              <img
                loading="lazy"
                src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/bl/_thumb-sm-1.webp"
              />
            </a>
            <a href="/screenshots/bl/sm-2.png" data-title="">
              <img
                loading="lazy"
                src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/bl/_thumb-sm-2.webp"
              />
            </a>
            <a href="/screenshots/bl/aira-2.png" data-title="">
              <img
                loading="lazy"
                src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/bl/_thumb-aira-2.webp"
              />
            </a>
            <a href="/screenshots/bl/aira-3.png" data-title="">
              <img
                loading="lazy"
                src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/bl/_thumb-aira-3.webp"
              />
            </a>
            <a href="/screenshots/bl/aira-4.png" data-title="">
              <img
                loading="lazy"
                src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/bl/_thumb-aira-4.webp"
              />
            </a>
            <a href="/screenshots/bl/sm-4.png" data-title="">
              <img
                loading="lazy"
                src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/bl/_thumb-sm-4.webp"
              />
            </a>
            <a href="/screenshots/bl/sm-3.png" data-title="">
              <img
                loading="lazy"
                src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/bl/_thumb-sm-3.webp"
              />
            </a>
            <a href="/screenshots/bl/ist-2.png" data-title="">
              <img
                loading="lazy"
                src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/bl/_thumb-ist-2.webp"
              />
            </a>
            <a href="/screenshots/bl/ist-3.png" data-title="">
              <img
                loading="lazy"
                src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/bl/_thumb-ist-3.webp"
              />
            </a>
            <a href="/screenshots/bl/ist-4.png" data-title="">
              <img
                loading="lazy"
                src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,h_272/v1627867206/ps/screenshots/bl/_thumb-ist-4.webp"
              />
            </a>
          </div>
        </div>
        <div className="description content">
          <p>
            Worked at an AI agency building automation tools and analytics
            dashboards for enterprise clients, especially for oil and gas
            industry. We built browser-based apps which
            queried/manipulated/rendered a lot of data in real time.
          </p>
          <p>
            Worked with brilliant CS majors, built admin dashboards and data
            visualizations. Worked a lot with React.JS, Vanilla JS, and D3 based
            graphing libraries. We built custom tools from scratch. Also used
            Vue.js and Angular 8. I was tasked with improving the UI of our
            software products, then adding features to meet tight deadlines. It
            was important to communicate efficiently and architect each app for
            easy refactoring in the future.
          </p>
        </div>
      </article>
    </BLStyled>
  );
};

const BLStyled = styled.div`
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

export default Section;
