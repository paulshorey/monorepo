import styled from "@emotion/styled";

export const HomeStyled = styled.div`
  .compare-anchor {
    position: relative;
    top: -40vh;
  }
  .homeScrollPeek {
    padding-top: 0.1rem;
    text-align: center;
    font-weight: bold;
    color: #999;
    svg {
      display: inline-block;
      margin: 0.1rem 1.25rem -0.1rem;
      font-size: 125%;
    }
  }
  code {
    white-space: pre;
  }
  .hinted {
    border: solid 2px hsl(59deg 99% 70%);
  }
  h4.hinted {
    padding-left: 0.67rem;
    position: relative;
    left: -0.67rem;
    margin-bottom: 0.5rem;
  }
  .highlighted {
    background: hsl(57deg 99% 72%);
  }
  b.highlighted {
    position: relative;
    padding-left: 0.25rem;
    left: -0.25rem;
    padding-right: 0.25rem;
  }
  h4.highlighted {
    padding-left: 0.67rem;
    position: relative;
    left: -0.67rem;
    margin-bottom: 0.5rem;
  }
  span.highlighted {
    padding-left: 0.3rem;
    padding-right: 0.33rem;
  }
  .underlined {
    border-bottom: solid 3px hsl(57deg 99% 70%);
    &.hide-underline-small {
      @media (max-width: 500px) {
        border-bottom: none;
      }
    }
  }
  .color-attention-dark {
    //text-shadow: 1px 1px 5px rgba(255,255,255,1);
  }
  article.container {
    position: relative;
    font-weight: 400;
    text-shadow: 1px 1px 5px rgba(255, 255, 255, 0.5);
    &.gradient {
      background: hsla(30, 50%, 96%);
      background: linear-gradient(
        to bottom,
        hsla(30, 50%, 93%) 0%,
        hsla(30, 50%, 98%) 1000px,
        hsla(30, 50%, 93%),
        hsla(30, 50%, 93%),
        hsla(30, 50%, 96%),
        hsla(30, 50%, 98%) 100%
      );
    }
    overflow: hidden; // to prevent child margin - just do NOT put height on this, and it will be OK
    z-index: 10;
    padding: 0.5rem 0 0;
    font-size: 1.125rem;
    color: var(--color-medium);
    /*> .content:first-child {
      margin-top: 2rem;
    }*/
    .h-text-scroll-up {
      padding-left: 1rem;
      font-size: 1rem;
      font-weight: 400;
    }
    /*
     * link styles
     */
    .link,
    a {
      text-shadow: 1px 1px 5px rgba(255, 255, 255, 0.5);
    }
    .q {
      cursor: pointer;
      position: relative;
      display: inline-block;
      padding-right: 0.67rem;
      opacity: 0.9;
      //color: var(--color-accent-dark);
      text-shadow: 1px 1px 5px rgba(255, 255, 255, 0.5);
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
      &::before {
        content: "?";
        position: absolute;
        display: inline-block;
        top: -1px;
        right: 0.1rem;
        opacity: 0.7;
        //color: var(--color-accent-dark);
        text-shadow: 1px 1px 5px rgba(255, 255, 255, 0.5);
        font-size: 0.75em;
        font-weight: 800;
      }
    }
    /*
     * top banner
     */
    .opening_statement {
      //font-size: 1.125rem;
      background: var(--color-gradient-background);
      //background: var(--color-subtle-light);
      color: var(--color-primary-dark);
      padding: 0.75rem 0;
      margin: 0;
      //box-shadow: 0 0px 2px rgba(150, 175, 180, 0.4);
      border-bottom: solid 1px var(--color-subtle);
      .content {
        margin-top: 0;
        margin-bottom: 0;
        b,
        strong {
          font-weight: 600;
        }
        img {
          position: relative;
          top: 0.35rem;
          left: 0.12rem;
          height: 3rem;
          padding-right: 1.2rem;
        }
        .text {
          flex-grow: 1;
          padding-bottom: 0.125rem;
          > span {
            display: block;
            &:first-child {
              padding: 0.25rem 0 0.1rem;
            }
            &:last-child {
              padding: 0.1rem 0 0.25rem;
              font-size: 0.9em;
            }
          }
        }
      }
    }
    /*
     * article
     */
    .examples {
      b {
        font-weight: 400;
        color: inherit;
      }
    }
    .p,
    p {
      display: block;
      padding: 0;
      margin: 0.5rem 0 1rem 0;
      color: hsl(0, 0%, 37%);
      text-shadow: 1px 1px 5px rgba(255, 255, 255, 0.5);
    }
    > p {
      margin: 0 0 1.25rem;
      line-height: 1.85rem;
    }
    .color-light {
      text-shadow: 1px 1px 5px rgba(255, 255, 255, 0.5);
    }
    .color-medium {
      text-shadow: 1px 1px 5px rgba(255, 255, 255, 0.5);
    }
    .color-dark {
      text-shadow: 1px 1px 5px rgba(255, 255, 255, 0.5);
    }
    .color-attention-dark {
      //text-shadow: 1px 1px 5px rgba(255,255,255,1);
    }
    .color-lighter {
      color: #7d7e7e;
    }
    .br {
      display: block;
      width: 100%;
      position: relative;
      height: 0;
      @media (max-width: 949px) {
        height: 1rem;
      }
    }
    h2,
    h3,
    h4 {
      font-weight: 500;
      &.attention {
        color: var(--color-attention-dark);
        opacity: 0.88;
        font-weight: 500;
      }
    }
    h4.attention {
      color: #6370ea;
    }
    h2 {
      font-size: 2rem;
      margin-top: 2rem;
      margin-right: -0.5rem;
      &:first-child {
        margin-top: 1.5rem;
        margin-bottom: 1.125rem;
        line-height: 1.67rem;
        margin-left: -1rem;
        sub {
          bottom: 0;
        }
      }
      @media (max-width: 599px) {
        font-size: 1.75rem;
      }
      @media (max-width: 449px) {
        font-size: 1.5rem;
      }
    }
    h3 {
      font-size: 1.67rem;
      margin-top: 1.67rem;
      margin-right: -0.5rem;
      @media (max-width: 599px) {
        font-size: 1.5rem;
      }
      @media (max-width: 449px) {
        font-size: 1.33rem;
      }
    }
    h4 {
      font-size: 1.33rem;
      margin-top: 1.33rem;
      margin: 1.5rem 0 0.75rem 0;
    }
    a b {
      color: inherit;
    }
    b,
    strong {
      font-weight: 600;
    }
    hr,
    .hr {
      border: none;
      height: 1rem;
      display: block;
    }
    .article_ul {
      margin: 3rem -1.51rem 3rem;
      padding: 1.5rem 1rem 0.5rem;
      //border-left: solid 1px var(--color-subtle-light);
      //border-top: solid 1px var(--color-subtle-light);
      box-shadow: var(--box-shadow-dark);
      background: white;
      .article_li {
        margin-bottom: 3rem;
        list-style: none;
        p {
          margin: 0.75rem 0 1.25rem;
        }
      }
    }

    .comparisons {
      margin: 1rem -1.51rem 3rem;
      padding: 0.5rem 1rem 0.5rem;
      box-shadow: var(--box-shadow-dark);
      background: white;
    }

    .highlight-left,
    .highlight-right {
      display: block;
      color: #333;
      border-radius: 5rem;
      a {
        font-weight: 500;
      }
      @media (max-width: 699px) {
        border-radius: 0;
      }
      &.w-image {
        display: flex;
        align-items: center;
        .p-content {
          flex-grow: 1;
        }
        .p-image {
          img {
            float: left;
            margin: 0 1rem 0 0.5rem;
            width: 5.65rem;
            height: auto;
            max-width: 11.5vw;
          }
        }
      }
    }
    .highlight-left {
      position: relative;
      margin: 0 -5rem 0 -15.5rem;
      padding: 1.1rem 5rem 1.1rem 15rem;
      background: linear-gradient(to right, transparent, white, white, white, transparent);
    }
    .highlight-right {
      margin: 0 -8rem 0 0;
      padding: 1.2rem 8rem 1.3rem 0;
      //background: linear-gradient(to left, transparent, rgba(255,255,255,0.25), transparent);
    }

    p.with_button {
      line-height: 2.5rem;
      margin-top: 1.75rem;
      button {
        position: relative;
        top: -0.05rem;
        left: -0.025rem;
        margin-right: 0.75rem;
        background: linear-gradient(-45deg, var(--color-accent), hsl(91, 100%, 40%), var(--color-accent));
        &:hover {
          background: var(--color-accent);
        }
        height: 2.5rem;
        line-height: 2.2rem;
        border-radius: 1.125rem;
        font-weight: 600;
        color: white;
        border: none;
        padding: 0 1.125rem;
      }
    }
  }
  .dom-examples-title {
    color: var(--color-accent-dark);
    position: relative;
    margin: 0 0.33rem 0 -0.1rem;
    line-height: 2.25rem;
    height: 2.3rem;
    background: var(--color-white);
    box-shadow: 0 0px 2px rgba(150, 175, 180, 0.4);
    border-radius: 1.125rem;
    padding: 0 1.25rem;
    cursor: pointer;
    display: inline-block;
  }
  .carousel_section_container {
    margin-top: 1.5rem;
    margin-bottom: 0;
  }
`;
