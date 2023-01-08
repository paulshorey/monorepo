import styled from "@emotion/styled";

export const Styled = styled.div`
  font-size: 1rem;
  position: relative;
  padding-top: 1.5rem;
  padding-bottom: 2rem;

  .editWordLink {
    position: absolute;
    z-index: 99;
    top: 0.75rem;
    right: 1rem;
    font-size: 2rem;
    color: var(--color-light);
    //z-index:100;
  }
  .deleteWordLink {
    position: absolute;
    z-index: 99;
    top: 5.5rem;
    right: 1.5rem;
    font-size: 1.25rem;
    color: var(--color-bad);
  }
  .break30 {
    color: var(--color-light);
    font-weight: bold;
    font-size: 70%;
  }
  .select30 {
    cursor: pointer;
    font-size: 70%;
  }

  .title {
    font-size: 1.25rem;
  }
  .posDiv {
    padding: 0.5rem 0;
    .posword {
      font-size: 1.25rem;
    }
  }
`;
