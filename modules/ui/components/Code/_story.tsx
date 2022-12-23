import Code from '.';
import CanvasContainer from '@techytools/ui/.storybook/components/CanvasContainer';
import CanvasStoryPadding from '@techytools/ui/.storybook/components/CanvasStoryPadding';
import useShowStorybookCode from '@techytools/ui/hooks/useShowStorybookCode';

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

export const code = `import Code from '@techytools/ui/components/Code';

<Code 
  code={\`import React, { useState } from "react"; ...\`}
  language="jsx"
  variant={"transparentDark"}
  showNumbers={true}
  ss={"margin:0;"}
/>
`;
