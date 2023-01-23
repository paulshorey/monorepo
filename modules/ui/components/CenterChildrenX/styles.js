export default {
  default: (props) => `
    text-align: center;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    > * {
      display: inline-block;
      margin-left: initial;
      margin-right: initial;
    }
  `,
};
