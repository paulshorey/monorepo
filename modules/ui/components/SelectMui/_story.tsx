import React from 'react';
import SelectMui from '.';
import CanvasContainer from '@ps/ui/.storybook/components/CanvasContainer';
import CanvasStoryPadding from '@ps/ui/.storybook/components/CanvasStoryPadding';
import { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import useShowStorybookCode from '@ps/ui/hooks/useShowStorybookCode';

export const SelectStory = (props) => {
  const [age, setAge] = React.useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value as string);
  };

  return (
    <SelectMui value={age} label="Age" onChange={handleChange} {...props}>
      <MenuItem value={10}>Ten</MenuItem>
      <MenuItem value={20}>Twenty</MenuItem>
      <MenuItem value={30}>Thirty</MenuItem>
    </SelectMui>
  );
};

export default (props) => {
  useShowStorybookCode();
  return (
    <CanvasContainer>
      <CanvasStoryPadding>
        <SelectStory {...props} />
      </CanvasStoryPadding>
      <CanvasStoryPadding bgcolor="light" textcolor="purple">
        <SelectStory {...props} />
      </CanvasStoryPadding>
    </CanvasContainer>
  );
};

export const code = `import SelectMui from '@ps/ui/components/SelectMui';

<SelectMui value={age} label="Age" onChange={handleChange}>
  <MenuItem value={10}>Ten</MenuItem>
  <MenuItem value={20}>Twenty</MenuItem>
  <MenuItem value={30}>Thirty</MenuItem>
</SelectMui>
`;
