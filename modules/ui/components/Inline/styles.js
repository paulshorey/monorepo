export default {
  default: `
  position:relative;
  display:inline;
  margin:0;
  padding:0;
`,

  color: `
color: var(--color);
`,

  gradientUnderlined: `
position:relative;
color: var(--color-text);
background-color: var(--color-text);
background-image: var(--color-text-gradient);
background-size: 100%;
background-clip: text;
-webkit-text-fill-color: transparent;
&::after {
content: '';
position: absolute;
bottom: -0.125rem;
left: 0;
right: 0;
height: 0.125rem;
width:100%;
background-color: var(--color-text);
background-image: var(--color-text-gradient);
background-size: 100%;
}
`,

  hoverTilt: (props) => `
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  &:hover {
    box-shadow: 0 0 50px rgb(17 17 17 / 20%);
    transform: rotate(-2deg) translateY(-2px) scale(1.05);
    ${props.theme.mq.sm} {
      transform: rotate(-1.5deg) translateY(-1px) scale(1.025);
    }
  }
`,

  underlineBold: `
  text-decoration: underline;
  text-underline-offset: 0.25rem;
  text-decoration-thickness: 0.1rem;
  `,

  underlineStrong: `
  text-decoration: underline;
  text-underline-offset: 0.25rem;
  text-decoration-thickness: 0.125rem;
  `,
};
