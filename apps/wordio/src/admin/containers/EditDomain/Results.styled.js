import styled from "@emotion/styled";

export default styled.div`
  font-size: 1rem;
  position: relative;
  padding-top: 0;

  h3 {
    font-size: 1em;
    font-weight: bold;
    line-height: 2.67rem;
    color: var(--color-dark);
  }
  .cue {
    color: var(--color-light);
  }

  .columns {
    //width: 3000px;
  }
  .column {
    overflow: visible;
    width: 200px;
    margin: 0 30px 0 0;
    //flex-grow: 0;
  }
  .dictKey {
    margin: 1rem 0 0;
    line-height: 1.75rem;
    font-weight: bold;
  }
  .dictLine {
    display: block;
    &a&:hover {
      color: var(--color-link);
    }
    &.syns2 {
      white-space: pre;
      font-size: 1.125rem;
      color: var(--color-dark);
      margin: 0.5rem 0 0 0;
      line-height: 1.125rem;
      padding-left: 0;
      .posword {
        padding-right: 0.5rem;
      }
    }
    &.syns3 {
      font-size: 1rem;
      color: var(--color-light);
      white-space: pre;
      margin: 0.125rem 0 0 0;
      line-height: 1.125rem;
      padding-left: 0.75rem;
    }
  }

  .domain-section {
    margin: 1rem 0 0 0;
    padding: 0;
    overflow: auto;
    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      border: none;
      margin-top: 2rem;
    }
    > .flexrow.posDiv {
      position: absolute;
      left: 0;
    }
  }
  .domain-syns-paragraph {
    line-height: 1.9rem;
    margin-top: 1.25rem;
    > span {
      color: var(--color-light);
      padding-right: 0.5rem;
      display: inline-block;
      > span {
        color: var(--color-dark);
        font-size: 1.1rem;
        display: inline-block;
      }
    }
  }
`;
