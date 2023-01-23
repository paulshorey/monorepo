export default {
  default: (props) => `
    overflow: hidden;
    position: relative;
    display: block;
    cursor: pointer;
    white-space: pre;
    border-radius: 0.5rem;
    margin:1rem 0 2rem;
    padding:0;
    overflow:auto;
    font-size: 0.9rem;
    pre {
      margin:0;
      padding: 0.8rem 0.25rem 0.75rem 0.25rem;
    }
    box-shadow: 1px 2px 3px 2px rgba(0,0,0,0.1);
  `,
  transparentDark: ``,
  dark: ``,
  transparentLight: ``,
  light: ``,
};
// linear-gradient(to right, transparent 70%, hsla(22deg 5% 16% / 0.9) 90%)
