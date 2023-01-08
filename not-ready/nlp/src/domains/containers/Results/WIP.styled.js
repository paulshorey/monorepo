import styled from "@emotion/styled";
// import { is_retina } from "@techytools/fn/io/ui"

export const WIPStyled = styled.div`
  position: relative;
  z-index: 10;
  margin: 0;
  padding: 0.33rem 0 1rem 2px;
  color: var(--color-light);
  font-size: 1rem;
  &.OptionsToggle {
    //max-height: 2.5rem;
  }
  .content {
    padding-top: 0;
    padding-bottom: 0;
  }
  .columns {
    overflow: scroll;
    max-height: 50vh;
    @media (max-height: 800px) {
      max-height: 75vh;
    }
    .column {
      margin-right: 1.5rem;
    }
    &::-webkit-scrollbar {
      -webkit-appearance: none;
      width: 8px;
      height: 8px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 5px;
      background-color: rgba(0, 0, 0, 0.5);
      //-webkit-box-shadow: 0 0 1px rgba(255,255,255,.5);
    }
  }
  .aftermarket {
    &::before {
      content: "aftermarket:";
      display: block;
      margin-bottom: -0.33rem;
    }
    display: block;
    padding: 0.33rem 0 0 0;
    white-space: nowrap;
    position: relative;
    width: 8rem;
    .option {
      margin: 0.33rem 0;
    }
  }
  .options-title {
    color: var(--color-link);
    font-size: 0.9rem;
    margin: 1rem 0 0 0;
    line-height: 2rem;
  }
  .more_options {
    min-height: 1.75rem;
    position: relative;
    padding: 0.5rem 1rem 0.25rem 1rem;
    border: solid 1px rgba(0, 0, 0, 0.125);
    margin-top: 0.625rem;
    margin-bottom: 1.25rem;
    &.margin {
      margin-top: 2.25rem;
      margin-bottom: 1.125rem;
    }
  }
  .option {
    //display: inline-block;
    margin: 0.5rem 0;
    line-height: 1;
    color: var(--color-light);
    > * {
      line-height: 1;
    }
    .checkbox-group {
      margin-right: 0.75rem;
      color: var(--color-link);
      line-height: 1;
      vertical-align: middle;
      > * {
        line-height: 1;
        vertical-align: middle;
      }
    }
    button + span {
      display: inline-block;
      line-height: 1rem;
      vertical-align: baseline;
      padding-left: 0.33rem;
      margin-top: 0.25rem;
    }
  }
  .toggle-more-options {
    font-weight: 600;
    color: var(--color-attention-light);
    line-height: 1.5rem;
    font-size: 1rem;
    padding: 0.5rem 0 0 0;
    text-align: right;
    @media (max-width: 699px) {
      padding-right: 0.75rem;
    }
    > span {
      font-size: 0.875rem;
      vertical-align: 0.125rem;
    }
    svg {
      transform: scale(1.4);
      vertical-align: -0.06rem;
      &.faSort {
        transform: scale(1.125);
        vertical-align: -0.125rem;
      }
      &.faSliders {
        margin-left: 0.1rem;
        transform: scale(1.175);
        vertical-align: -0.15rem;
      }
      &.faCaretDown {
        transform: scale(1.33);
        vertical-align: -0.105rem;
      }
    }
  }
  .more_options_coming {
    color: var(--color-medium);
    margin-top: 1.125rem;
    padding-top: 0.75rem;
    padding-bottom: 0.125rem;
    border-top: solid 1px var(--color-subtle);
  }
  .showOptions {
    position: relative;
    top: 0;
    svg {
      transform: scale(1.125);
      //vertical-align: -0.025rem;
    }
  }
`;
