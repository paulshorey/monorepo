import React from 'react';
import { withButton } from '.';
import CanvasContainer from '@ps/ui/.storybook/components/CanvasContainer';
import CanvasStoryPadding from '@ps/ui/.storybook/components/CanvasStoryPadding';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import useShowStorybookCode from '@ps/ui/hooks/useShowStorybookCode';

export const Buttons = (props) => {
  useShowStorybookCode();
  const Button = withButton({
    size: 'sm',
    ...props,
    ss: 'margin: 0 0.875rem 0.875rem 0;',
  });
  return (
    <>
      <Button loading icon={<FA icon={faUser} />}>
        Loading
      </Button>
      <Button variant="outlined" icon={<FA icon={faUser} />}>
        Outlined
      </Button>
      <Button variant="text" icon={<FA icon={faUser} />}>
        Text
      </Button>
      <Button round icon={<FA icon={faUser} />} />
    </>
  );
};
export default (props) => (
  <>
    <CanvasContainer>
      <CanvasStoryPadding
        data-bgcolor="light"
        data-textcolor="purple"
        data-bggradient
      >
        <Buttons {...props} />
      </CanvasStoryPadding>
      <CanvasStoryPadding
        data-bgcolor="purple"
        data-textcolor="light"
        data-bggradient
      >
        <Buttons {...props} />
      </CanvasStoryPadding>
    </CanvasContainer>
  </>
);

export const code = `import { withButton } from '@ps/ui/components/Button'; // optional (you can also use default export as Button )
  
const Button = withButton({
  size: 'lg',
  round: true,
  ss: 'margin: 0 0.875rem 0.875rem 0;',
});

<Button
  loading
  icon={<FA icon={faUser} />}
>
  Loading
</Button>

<Button variant="outlined" icon={<FA icon={faUser} />}>
  Outlined
</Button>

<Button variant="text" icon={<FA icon={faUser} />}>
  Text
</Button>

<Button round icon={<FA icon={faUser} />} />`;
