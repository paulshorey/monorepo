import Block from '@techytools/ui/components/Block';
import { css } from '@emotion/react';
import Nav from 'components/layout/Nav';
import Logo from 'components/layout/Logo';

const style = () => css`
  position: relative;
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: -1rem;
  button span {
    margin: 0;
    padding: 0;
  }
  label: FlexHeader;
`;

const FlexHeader = () => {
  return (
    <Block ss={style}>
      <Logo />
      <Nav />
    </Block>
  );
};

export default FlexHeader;
