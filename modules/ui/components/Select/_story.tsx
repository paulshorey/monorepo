import Select, { Option, OptionProps } from '.';
import React from 'react';
import CanvasContainer from '@ps/ui/.storybook/components/CanvasContainer';
import CanvasStoryPadding from '@ps/ui/.storybook/components/CanvasStoryPadding';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import useShowStorybookCode from '@ps/ui/hooks/useShowStorybookCode';

const style = {
  margin: '0 0.875rem 0.875rem 0',
  minWidth: '10rem',
  width: '45%',
};

const CustomOptionChildren = (props) => (
  <Select
    {...props}
    style={style}
    placeholder="Custom option children"
    optionLabelProp="label"
    defaultValue={['usa']}
  >
    <Option value="usa">
      <h3>🇺🇸 USA (美国)</h3>
    </Option>
    <Option value="china">
      <h3> 🇨🇳 China (中国)</h3>
    </Option>
    <Option value="japan">
      <h3>🇯🇵 Japan (日本)</h3>
    </Option>
    <Option value="korea">
      <h3>🇰🇷 Korea (韩国)</h3>
    </Option>
  </Select>
);

const WithSuffixIcon = (props) => (
  <Select
    {...props}
    style={style}
    showSearch
    defaultValue={['jack']}
    placeholder="With suffix icon"
    suffixIcon={<FontAwesomeIcon icon={faUser} />}
    options={[
      {
        value: 'jack',
        label: 'Jack',
      },
      {
        value: 'lucy',
        label: 'Lucy',
      },
      {
        value: 'tom',
        label: 'Tom',
      },
    ]}
  />
);

const tags: OptionProps[] = [];
for (let i = 10; i < 36; i++) {
  tags.push({
    value: i.toString(36) + i,
    label: i.toString(36) + i,
    children: i.toString(36) + i,
  });
}
const CommaSeparatedTags = (props) => (
  <Select
    {...props}
    mode="tags"
    style={{ ...style, width: '100%' }}
    tokenSeparators={[',']}
    options={tags}
    defaultValue={['a10']}
    placeholder="Comma separated tags"
  />
);
const SelectMultiple = (props) => (
  <Select
    {...props}
    style={{ ...style, width: '100%' }}
    mode="multiple"
    placeholder="Select multiple"
    defaultValue={['usa', 'china']}
    optionLabelProp="label"
  >
    <Option value="usa">
      <div>
        <span role="img" aria-label="USA">
          🇺🇸
        </span>
        USA (美国)
      </div>
    </Option>
    <Option value="china">
      <div>
        <span role="img" aria-label="China">
          🇨🇳
        </span>
        China (中国)
      </div>
    </Option>
    <Option value="japan">
      <div>
        <span role="img" aria-label="Japan">
          🇯🇵
        </span>
        Japan (日本)
      </div>
    </Option>
    <Option value="korea">
      <div>
        <span role="img" aria-label="Korea">
          🇰🇷
        </span>
        Korea (韩国)
      </div>
    </Option>
  </Select>
);

export default (props) => {
  useShowStorybookCode();
  return (
    <CanvasContainer>
      <CanvasStoryPadding>
        <CustomOptionChildren {...props} />
        <WithSuffixIcon {...props} />
        <SelectMultiple {...props} />
        <CommaSeparatedTags {...props} />
      </CanvasStoryPadding>
      <CanvasStoryPadding bgcolor="light" textcolor="dark">
        <CustomOptionChildren {...props} />
        <WithSuffixIcon {...props} />
        <SelectMultiple {...props} />
        <CommaSeparatedTags {...props} />
      </CanvasStoryPadding>
    </CanvasContainer>
  );
};

export const code = `

const CustomOptionChildren = (props) => (
  <Select
    style={style}
    placeholder="Custom option children"
    optionLabelProp="label"
    defaultValue={['usa']}
  >
    <Option value="usa">
      <h3>🇺🇸 USA (美国)</h3>
    </Option>
    <Option value="china">
      <h3> 🇨🇳 China (中国)</h3>
    </Option>
    <Option value="japan">
      <h3>🇯🇵 Japan (日本)</h3>
    </Option>
    <Option value="korea">
      <h3>🇰🇷 Korea (韩国)</h3>
    </Option>
  </Select>
);

const WithSuffixIcon = (props) => (
  <Select
    showSearc
    defaultValue={['jack']}
    placeholder="With suffix icon"
    suffixIcon={<FontAwesomeIcon icon={faUser} />}
    options={[
      {
        value: 'jack',
        label: 'Jack',
      },
      {
        value: 'lucy',
        label: 'Lucy',
      },
      {
        value: 'tom',
        label: 'Tom',
      },
    ]}
  />
);

const CommaSeparatedTags = (props) => (
  <Select
    mode="tags"
    style={{ ...style, width: '100%' }}
    tokenSeparators={[',']}
    options={[{value: 'a10', label: 'a10', children: 'a10'}, {value: 'b10', label: 'b10', children: 'b10'}, {value: 'c10', label: 'c10', children: 'c10'}]}
    defaultValue={['a10']}
    placeholder="Comma separated tags"
  />
);

const SelectMultiple = (props) => (
  <Select
    style={{ ...style, width: '100%' }}
    mode="multiple"
    placeholder="Select multiple"
    defaultValue={['usa', 'china']}
    optionLabelProp="label"
  >
    <Option value="usa">
      <div>
        <span role="img" aria-label="USA">
          🇺🇸
        </span>
        USA (美国)
      </div>
    </Option>
    <Option value="china">
      <div>
        <span role="img" aria-label="China">
          🇨🇳
        </span>
        China (中国)
      </div>
    </Option>
    <Option value="japan">
      <div>
        <span role="img" aria-label="Japan">
          🇯🇵
        </span>
        Japan (日本)
      </div>
    </Option>
    <Option value="korea">
      <div>
        <span role="img" aria-label="Korea">
          🇰🇷
        </span>
        Korea (韩国)
      </div>
    </Option>
  </Select>
);
`;
