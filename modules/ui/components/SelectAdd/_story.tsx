import SelectAdd, { Props as SelectAddProps } from '.';
import React from 'react';
import CanvasContainer from '@techytools/ui/.storybook/components/CanvasContainer';
import CanvasStoryPadding from '@techytools/ui/.storybook/components/CanvasStoryPadding';
import useShowStorybookCode from '@techytools/ui/hooks/useShowStorybookCode';

const style = {
  margin: '0 0.875rem 0.875rem 0',
  minWidth: '10rem',
  width: '45%',
};

const DemoOne = (props: SelectAddProps) => {
  const [values, setValues] = React.useState<string[]>(props.values);
  const [value, setValue] = React.useState<string>(props.value);

  const handleValuesRemove = (value: string) => {
    setValues(values.filter((v) => v !== value));
  };

  const handleValuesAdd = (value: string) => {
    setValues([...values, value]);
  };

  const handleValueSelect = (value: string) => {
    setValue(value);
  };

  return (
    <SelectAdd
      onChange={(value) => {
        handleValueSelect(value);
      }}
      onAdd={(value) => {
        handleValuesAdd(value);
      }}
      onRemove={(value) => {
        handleValuesRemove(value);
      }}
      {...props}
      values={values}
      value={value}
      style={style}
    />
  );
};
export default (props) => {
  useShowStorybookCode();
  return (
    <CanvasContainer>
      <CanvasStoryPadding>
        <DemoOne {...props} />
      </CanvasStoryPadding>
      <CanvasStoryPadding bgcolor="light" textcolor="dark">
        <DemoOne {...props} />
      </CanvasStoryPadding>
    </CanvasContainer>
  );
};

export const code = `import SelectAdd, { Props as SelectAddProps } from '@techytools/ui/components/SelectAdd';

const [values, setValues] = React.useState<string[]>(['Jack', 'Lucy', 'Tom']);
const [value, setValue] = React.useState<string>(undefined);

const handleValuesRemove = (value: string) => {
  setValues(values.filter((v) => v !== value));
};

const handleValuesAdd = (value: string) => {
  setValues([...values, value]);
};

const handleValueSelect = (value: string) => {
  setValue(value);
};

<SelectAdd
  style={style}
  showSearch
  placeholder="Select a person"
  addPlaceholder="Add new person"
  values={values}
  value={value}
  onChange={(value) => {
    handleValueSelect(value);
  }}
  onAdd={(value) => {
    handleValuesAdd(value);
  }}
  onRemove={(value) => {
    handleValuesRemove(value);
  }}
/>`;
