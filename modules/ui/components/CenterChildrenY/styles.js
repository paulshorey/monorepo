export default {
  default: (props) => `
    height:100%;
    text-align: center;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    > * {
      display: inline-block;
      margin-left: initial;
      margin-right: initial;
    }
  `,
};
