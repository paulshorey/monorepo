// import React from 'react';
import InputGroup from '@techytools/ui/components/InputGroup';
import Input from '@techytools/ui/components/Input';
import Button from '@techytools/ui/components/Button';
import Select, { Option } from '@techytools/ui/components/Select';
import CenterChildrenY from '@techytools/ui/components/CenterChildrenY';
import CenterChildrenX from '@techytools/ui/components/CenterChildrenX';
import { analytics_track_page } from '@techytools/fn/browser/analytics';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    analytics_track_page({
      name: 'Search widget',
      path: '/widgets/search',
    });
  }, []);

  const propsGroup = {};
  const propsInput = {};

  return (
    <CenterChildrenY ss="height:100vh;" bggradient="cool">
      <CenterChildrenX>Search bar goes here</CenterChildrenX>
      <p>
        <InputGroup {...propsGroup}>
          <Input {...propsInput} prefix="http://" placeholder="mysite" />
          <Input
            {...propsInput}
            style={{
              width: '20%',
              maxWidth: '15rem',
            }}
            placeholder=".com"
          />
          <Select
            {...propsInput}
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
            {...propsInput}
            ss=".Button--text {padding-right:2rem !important;}"
            type="submit"
            bgcolor="cool"
          >
            Go
          </Button>
        </InputGroup>
      </p>
    </CenterChildrenY>
  );
}
