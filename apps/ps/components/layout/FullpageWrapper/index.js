import ReactFullpage from '@fullpage/react-fullpage';
import React, { useEffect } from 'react';
import Block from '@ps/ui/components/Block';
import style from './style';

// const pluginWrapper = () => {
//   // eslint-disable-next-line import/extensions
//   require('./fullpage.scrollHorizontally.min.js');
// };

/**
 * IMPORTANT:
 * Each fullpage section must have className="section".
 * Horizontal sections must be children of a .section and have className="slide".
 */
const Fullpage = ({ children, ...props }) => {
  useEffect(() => {}, []);
  return (
    <Block data-component="FullpageWrapper" ss={style} {...props}>
      <ReactFullpage
        controlArrows={false}
        licenseKey={process.env.NEXT_PUBLIC_FULLPAGE_JS_KEY}
        // pluginWrapper={pluginWrapper}
        // responsiveSlides={true} /* Because we are using the extension */
        // responsiveWidth={931}
        // scrollHorizontally={true}
        // scrollHorizontallyKey={process.env.NEXT_PUBLIC_FULLPAGE_HORIZONTAL_KEY}
        // scrollingSpeed={1000}
        render={({ fullpageApi, state }) => {
          return <ReactFullpage.Wrapper>{children}</ReactFullpage.Wrapper>;
        }}
      />
    </Block>
  );
};

export default Fullpage;
