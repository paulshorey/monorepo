import Code from '.';
import CanvasContainer from '@ps/ui/.storybook/components/CanvasContainer';
import CanvasStoryPadding from '@ps/ui/.storybook/components/CanvasStoryPadding';
import useShowStorybookCode from '@ps/ui/hooks/useShowStorybookCode';

export default (props) => {
  useShowStorybookCode();
  return (
    <CanvasContainer>
      <CanvasStoryPadding>
        <Code {...props} />
      </CanvasStoryPadding>
    </CanvasContainer>
  );
};

export const code = `import Code from '@ps/ui/components/Code';

<Code 
  code={\`import React, { useState } from "react"; ...\`}
  language="jsx"
  variant={"transparentDark"}
  showNumbers={true}
  ss={"margin:0;"}
/>
`;
