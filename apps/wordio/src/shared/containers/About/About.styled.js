import styled from "@emotion/styled";

export const AboutUs = styled.div`
  h2 {
    font-size: 1.75rem;
    line-height: 2.75rem;
    color: var(--color-attention);
    margin-top: 1.75rem;
    margin-bottom: 1rem;
  }
  p {
    font-size: 1.125rem;
    color: #7d7e7e;
    margin: 1rem 0;
  }
  .link {
    color: var(--color-accent);
  }
  .before,
  .after {
    margin: 1.75rem 0;
  }
  .readMore {
    color: var(--color-link);
  }
  .titleWithButton {
    position: relative;
    margin-top: 1rem;
    button {
      position: absolute;
      top: 0;
      right: 0;
    }
  }
  .p_break {
    display: block;
    height: 10px;
  }
`;

export const ContactUsButton = styled.button`
  border: none;
  background: var(--color-link);
  color: white;
  font-weight: bold;
  padding: 0.5rem 1rem;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.3);
  border-radius: 1.25rem;
  svg {
    margin-left: 0.5rem;
  }
  //background: linear-gradient(45deg, var(--color-accent-dark), var(--color-accent), var(--color-accent-dark));
  background: linear-gradient(-45deg, var(--color-accent), hsl(91, 100%, 40%), var(--color-accent));
  &:hover {
    background: var(--color-accent);
  }
`;
