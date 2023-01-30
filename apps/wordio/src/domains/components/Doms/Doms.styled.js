import styled from "@emotion/styled";
import is_retina from "@techytools/fn/browser/device/is_retina";

export const DomsStyled = styled.div`
  user-select: none;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  flex-grow: 1;

  h5 {
    color: var(--color-link);
    font-weight: 600;
    font-size: 0.85rem;
    line-height: 1.5rem;
    margin: 0.9rem 0 0.3rem;

    &.attention {
      color: var(--color-attention);
    }

    &.options {
      margin: 1rem 0 0;
    }
  }

  .original_message {
    display: block;
    text-indent: 0.125rem;
    overflow: visible;
    padding: 0.67rem 0 0.33rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-link);

    a,
    .link {
      text-decoration: none;
      border-bottom: solid 1px currentColor;
    }

    .preIcon {
      vertical-align: -0.175rem;
      margin-right: 0.175rem;
    }

    .IconFrown {
      margin-right: 0.25rem;
      letter-spacing: -0.5px;
    }
  }

  .doms_group {
    position: relative;
    padding-right: 0.75rem;
    margin-top: 2.25rem;

    &.no_label {
      margin-top: 1.125rem;
    }

    @media (max-width: 1299px) {
      padding-right: 0;
    }

    &.hide_title {
      margin-top: 0.33rem;
      @media (max-width: 1299px) {
        margin-top: 0.44rem;
      }

      h5 {
        display: none;
      }
    }

    .doms_title {
      left: 0.2rem;
    }

    :not(:first-of-type) {
      .doms_title {
        position: absolute;
        top: -2.75rem;
        width: 100%;
        pointer-events: none;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }

    &:first-of-type {
      margin-top: 0;

      .doms_title {
        position: relative;
        margin-bottom: 0.45rem;
      }
    }

    .doms_content {
      .dom_name {
        position: relative;
        display: inline-block;
        margin: 0 0 0.125rem 0;
        width: 50%;
        max-width: 62vw;
        @media (max-width: 999px) {
          width: 100%;
        }

        .dom_card {
          color: inherit;
          text-decoration: none;
          display: inline-block;
          position: relative;
          width: calc(100% - 1.5rem);
          margin: 0 1.5rem 0.33rem 0;
          line-height: 2.275rem;
          height: 2.3rem;
          background: var(--color-white); //${is_retina() ? "var(--color-white-retina)" : "var(--color-white)"};
          box-shadow: var(--box-shadow-dark);
          border-radius: 1.125rem;
          padding: 0 1.25rem;
          cursor: pointer;

          .price {
            font-size: 0.9rem;
          }

          .word {
            background: var(--color-white);
            position: relative;
            border-radius: 0.25rem;
            padding-right: 0.05rem;
            font-size: 1.125rem;
            font-weight: 500;
            white-space: nowrap;
          }

          .icon {
            position: absolute;
            top: 0;
            right: 0.9rem;

            .q101 {
              transform: scale(0.85);
              display: inline-block;
              font-weight: 500;
              vertical-align: -1.1px;
              margin-left: -1.1px;
            }

            svg {
              position: relative;
              transform: scale(0.6);
              top: 0.05rem;

              &.faDollarSign {
                top: 0;
                transform: scale(0.67);
              }

              &.faSmileBeam {
                position: relative;
                top: 0.025rem;
                margin-right: -0.15rem;
                transform: scale(0.85);
              }

              &.faDoubleDollarSign {
                position: relative;
                top: 0.025rem;
                margin-left: -0.15rem;
                margin-right: 0.05rem;
                transform: scale(0.67);
              }

              &.faDoubleQuestion {
                margin-left: -0.25rem;
              }

              &.faHeart {
                top: 0.075rem;
                transform: scale(0.7);
              }

              &.faPlusSquare {
                margin-right: -0.01rem;
                transform: scale(0.85);
              }

              &.faCheck {
                top: 0.08rem;
                transform: scale(0.8);
              }

              &.faStar {
                transform: scale(0.8);
              }

              &.faTimes {
                transform: scale(0.85);
              }

              &.faPlus {
                top: 0.05rem;
                transform: scale(0.67);
              }

              &.faRedo {
                animation-name: spin;
                animation-duration: 1250ms;
                animation-iteration-count: infinite;
                animation-timing-function: linear;
              }
            }

            .textQuestion {
              font-size: 1rem;
              line-height: 1;
              top: -0.05rem;
              position: relative;
              font-weight: 500;
              opacity: 0.9;
              padding-right: 0.2875rem;
            }

            .nDash {
              padding-right: 0.1rem;
            }

            .textDotCom {
              font-size: 0.85rem;
              line-height: 1;
              top: -0.1rem;
              right: -0.2rem;
              position: relative;
              font-weight: 500;
              opacity: 0.9;
              padding-right: 0;
            }

            .price {
              font-size: 0.85rem;
              vertical-align: 0.1rem;
              font-weight: 500;
              margin-left: -0.075rem;
              line-height: 1.15rem;
            }
          }
        }
      }

      .dom_name.unlimit {
        line-height: 1;
        padding: 0 1rem 0.25rem 1rem;
        margin: 0 1.5rem 0 0;
        font-size: 1rem;
        color: var(--color-attention-light);
        display: block;
        font-weight: 600;
        text-align: right;
        position: relative;
        height: 0;
        float: right;
        cursor: pointer;

        svg {
          transform: scale(1.33);
        }

        > span {
          font-size: 0.875rem;
          vertical-align: 0.05rem;
        }
      }
    }
  }

  .faded {
    opacity: 0.75;
  }

  .highlighted {
    border-bottom: solid 2px hsl(57deg 99% 72%);
  }
`;
