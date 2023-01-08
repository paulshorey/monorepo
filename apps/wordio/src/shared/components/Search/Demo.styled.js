import styled from "@emotion/styled";

export const StyledDemo = styled.div`
  position: absolute;
  bottom: 0.5rem;
  left: 0;
  width: 100vw;
  overflow: visible;
  height: calc(100% - 5rem);
  max-height: 900px;
  @media (max-width: 549px) {
    height: calc(100% - 17.17rem);
    .content {
      margin: 0;
    }
  }
  .download_button {
    position: absolute;
    height: auto;
    right: 18.5rem;
    bottom: 1rem;
    background: #3d3d3b;
    -webkit-border-radius: 50%;
    -moz-border-radius: 50%;
    border-radius: 50%;
    @media (max-width: 549px) {
      display: none;
    }
    a {
      display: block;
      img {
        width: 4.5rem;
        padding: 0.8rem 0.8rem 0.9rem 0.9rem;
      }
    }
  }
  .DemoContent {
    position: relative;
    padding: 0 !important;
    height: 100%;
    .Demo {
      @media (min-width: 550px) and (max-width: 1099px) {
        display: none;
      }
      background-repeat: no-repeat;
      transform-origin: bottom right;
      position: absolute;
      bottom: 0;
      right: 0;
      height: 100%;
      width: 100%;
      // mobile
      //@media (max-width: 549px) {
      //  background-size: cover;
      //  background-image: url("/bg/bestadomains_mobile.svg");
      //  background-position: center bottom;
      //}
      @media (min-width: 1050px) {
        // desktop
        bottom: 0.75rem;
        background-size: contain;
        background-position: right bottom;
        background-image: url("/bg/bestadomains_desktop.svg");
      }
    }
  }
  &.bestaname {
    .DemoContent {
      .Demo {
        //background-image: url("/bg/bestaname_mobile.svg");
        @media (min-width: 1050px) {
          background-image: url("/bg/bestaname_desktop.svg");
        }
      }
    }
  }
`;
