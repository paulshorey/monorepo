import React from 'react';
import Input, { Props as InputProps } from '@techytools/ui/components/Input';
import CanvasContainer from '@techytools/ui/.storybook/components/CanvasContainer';
import CanvasStoryPadding from '@techytools/ui/.storybook/components/CanvasStoryPadding';
import { InfoCircleOutlined, UserOutlined } from '@ant-design/icons';
import Popover from 'antd/es/popover';
import useShowStorybookCode from '@techytools/ui/hooks/useShowStorybookCode';

const InputStory = (props: InputProps) => {
  useShowStorybookCode();
  const style = `margin: 0 0.875rem 0.875rem 0;width:90%;`;
  return (
    <>
      <Input
        {...props}
        ss={style}
        placeholder="Full name"
        allowClear={true}
        value="Click x to clear"
      />

      <Input
        {...props}
        ss={style}
        placeholder="Username"
        prefix={<UserOutlined />}
        suffix={
          <Popover content={<div className="noWrap">Hello tooltip!</div>}>
            <InfoCircleOutlined />
          </Popover>
        }
      />

      <Input
        {...props}
        ss={style}
        placeholder="your-website"
        prefix={'http://'}
        suffix={'.com'}
        onPressEnter={(e) => {
          /* console.log('pressed enter', e)*/
        }}
      />
    </>
  );
};

export default (props) => (
  <CanvasContainer>
    <CanvasStoryPadding>
      <InputStory {...props} />
    </CanvasStoryPadding>
    <CanvasStoryPadding bgcolor="light" textcolor="purple">
      <InputStory {...props} />
    </CanvasStoryPadding>
  </CanvasContainer>
);

export const code = `import Input from '@techytools/ui/components/Input';

<Input
  ss={style}
  placeholder="Full name"
  allowClear={true}
  value="Click x to clear"
/>

<Input
  ss={style}
  placeholder="Username"
  prefix={<UserOutlined />}
  suffix={
    <Popover content={<div className="noWrap">Hello tooltip!</div>}>
      <InfoCircleOutlined />
    </Popover>
  }
/>

<Input
  ss={style}
  placeholder="your-website"
  prefix={'http://'}
  suffix={'.com'}
  onPressEnter={(e) => {
    /* console.log('pressed enter', e)*/
  }}
/>`;
