import React from 'react';
import Block from '../../components/Block';

const CanvasStoryPadding = (props)=>(
  <Block style={{padding: '30px 20px'}} id="CanvasStoryPadding" {...props} />
)

export default CanvasStoryPadding;

// &:first-child {
//   padding-top: 30px;
// }
// &:last-child {
//   padding-bottom: 30px;
// }