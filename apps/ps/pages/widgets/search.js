// import React from 'react';
import TurnstileWidget from '@ps/ps/components/form/TurnstileWidget';
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
      <p>Testing my UI library + CloudFlare's new turnstile</p>
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
              <h3>πΊπΈ USA (ηΎε½)</h3>
            </Option>
            <Option value="china" label="China">
              <h3> π¨π³ China (δΈ­ε½)</h3>
            </Option>
            <Option value="japan" label="Japan">
              <h3>π―π΅ Japan (ζ₯ζ¬)</h3>
            </Option>
            <Option value="korea" label="Korea">
              <h3>π°π· Korea (ι©ε½)</h3>
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
      <p>
        <TurnstileWidget />
      </p>
    </CenterChildrenY>
  );
}
