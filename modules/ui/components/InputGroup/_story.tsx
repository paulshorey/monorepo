import React from 'react';
import InputGroup from '@techytools/ui/components/InputGroup';
import Input from '@techytools/ui/components/Input';
import InputMui from '@techytools/ui/components/InputMui';
import Button from '@techytools/ui/components/Button';
import Select, { Option } from '@techytools/ui/components/Select';
import Tooltip from 'antd/es/tooltip';

import CanvasContainer from '@techytools/ui/.storybook/components/CanvasContainer';
import CanvasStoryPadding from '@techytools/ui/.storybook/components/CanvasStoryPadding';
import { CopyOutlined } from '@ant-design/icons';
import useShowStorybookCode from '@techytools/ui/hooks/useShowStorybookCode';
import { SelectStory } from '../SelectMui/_story';

const InputStory = (props) => {
  useShowStorybookCode();
  const childprops = {
    round: true,
    ...props,
  };
  return (
    <>
      <p>
        <InputGroup {...props}>
          <Input
            {...childprops}
            prefix="http://"
            placeholder="mysite"
            suffix={
              <Tooltip title="copy full url">
                <CopyOutlined />
              </Tooltip>
            }
          />
          <Input
            {...childprops}
            style={{
              width: '20%',
              maxWidth: '15rem',
            }}
            placeholder=".com"
          />
          <Select
            {...childprops}
            style={{
              width: '25%',
              maxWidth: '20rem',
            }}
            placeholder="country"
            optionLabelProp="label"
          >
            <Option value="usa" label="USA">
              <h3>🇺🇸 USA (美国)</h3>
            </Option>
            <Option value="china" label="China">
              <h3> 🇨🇳 China (中国)</h3>
            </Option>
            <Option value="japan" label="Japan">
              <h3>🇯🇵 Japan (日本)</h3>
            </Option>
            <Option value="korea" label="Korea">
              <h3>🇰🇷 Korea (韩国)</h3>
            </Option>
          </Select>
          <Button
            {...childprops}
            type="submit"
            ss=".Button--text { padding-right: 2rem !important; }"
          >
            Go
          </Button>
        </InputGroup>
      </p>
      <p>
        <InputGroup {...props}>
          <InputMui
            {...childprops}
            prefix="http://"
            placeholder="mysite"
            suffix={
              <Tooltip title="copy full url">
                <CopyOutlined />
              </Tooltip>
            }
            style={{
              width: '100%',
            }}
          />
          <SelectStory
            {...childprops}
            style={{
              width: '20%',
              maxWidth: '15rem',
            }}
          />
          <Button {...childprops} variant="outlined" type="submit">
            Go
          </Button>
        </InputGroup>
      </p>
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

export const code = `import InputGroup from '@techytools/ui/components/InputGroup';

<InputGroup>

  <Input
    round={true}
    prefix="http://"
    placeholder="mysite"
    suffix={
      <Tooltip title="copy full url">
        <CopyOutlined />
      </Tooltip>
    }
  />

  <Input
    round={true}
    style={{
      width: '20%',
      maxWidth: '15rem',
    }}
    placeholder=".com"
  />

  <Select
    round={true}
    style={{
      width: '25%',
      maxWidth: '20rem',
    }}
    placeholder="country"
    optionLabelProp="label"
  >
    <Option value="usa" label="USA">
      <h3>🇺🇸 USA (美国)</h3>
    </Option>
    <Option value="china" label="China">
      <h3> 🇨🇳 China (中国)</h3>
    </Option>
    <Option value="japan" label="Japan">
      <h3>🇯🇵 Japan (日本)</h3>
    </Option>
    <Option value="korea" label="Korea">
      <h3>🇰🇷 Korea (韩国)</h3>
    </Option>
  </Select>
  
  <Button
    round={true}
    style={{ paddingRight: '1.5rem' }}
    type="submit"
  >
    Go
  </Button>
  
</InputGroup>`;
