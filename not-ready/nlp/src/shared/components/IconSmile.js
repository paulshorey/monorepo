import React from "react";
import styled from "@emotion/styled";

export default ({ className = "" }) => (
  <IconFrownStyled className={"IconOG IconSmile " + className}>
    <span>:</span>
    <span className="x85">)</span>
  </IconFrownStyled>
);

export const IconFrownStyled = styled.span`
  transform: rotate(90deg);
  display: inline-block;
  letter-spacing: 1px;
  top: 0.01rem;
  position: relative;
  .x85 {
    display: inline-block;
    transform: scale(0.77);
    vertical-align: -1px;
  }
`;
