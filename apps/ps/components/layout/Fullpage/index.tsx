import React from 'react';
import CenterChildrenY from '@ps/ui/components/CenterChildrenY';
import Block from '@ps/ui/components/Block';
import HeaderLayout from 'components/layout/Logo';

const FullpageLayout = ({ children }) => {
  const styles = {
    y: { ss: `height:100vh;` },
    x: { ss: `width:100vw; text-align:center;` },
  };
  return (
    <>
      <HeaderLayout />
      <CenterChildrenY {...styles.y}>
        <Block {...styles.x}>{children}</Block>
      </CenterChildrenY>
    </>
  );
};
export default FullpageLayout;
