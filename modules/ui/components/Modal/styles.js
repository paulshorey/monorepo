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
    > .MuiBackdrop-root {
      background: rgba(25,25,25,0.67);
    }
    > div[tabindex="-1"] {
      background: var(--color-bg);
      color: var(--color-text);
      border-radius: 0.5rem;
      box-shadow: 0 0 0.5rem 0.5rem rgba(0, 0, 0, 0.1);
    }
  `,
  old: (props) => `
    width: 100%;
    height: 100%;
    overflow: auto;
    flex-grow: 1;
    > span {
      position: absolute;
      top: 24px;
      right: 20px;
      z-index: 1000000;
      display: block;
      background: none;
      border: none;
      outline: none;
      cursor: pointer;
      img {
        width: 18px;
        height: 18px;
      }
    }
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 15px auto 3vh;
      width: 100%;
      max-width: 880px;
      outline: none;
      position: relative;
      z-index: 1000;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 0 30px 0 hsla(0deg 0% 0% 0.2);
      background-color: #fff;
      padding: 25px 30px;
      height: auto;
      min-height: 300px;
      transition: min-height 1s, border-radius 0.4s;

      ${props.theme.mq.mobile} {
        margin: 0;
        padding: 15px 24px 15px 24px;
        transition: min-height 0.5s, border-radius 0.4s;
        border-radius: 0;
        min-height: 100%;
      }

      .reactModalCloseX {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 1000000000;
        img {
          background: white;
          border-radius: 50%;
          border: solid 3px white;
          width: 31px;
          height: 31px;
          margin: 8px;
        }
      }
  `,
};
