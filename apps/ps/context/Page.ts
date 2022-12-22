import React from 'react';

const PageContextData = {};
export default React.createContext(PageContextData);

export type pageContextType = {
  topText?: string | React.ReactNode;
};
