import React, { memo } from 'react';
import { css } from '@emotion/react';
import Select, { Option } from '@ps/ui/components/Select';
import controlsState, { controlsStateType } from 'state/controlsState';
import InputGroup from '@ps/ui/components/InputGroup';
import Block from '@ps/ui/components/Block';

const styles = {
  wrapper: css`
    width: 100%;
    > * {
      width: 100%;
    }
  `,
  option: css`
    &,
    h4,
    li,
    ul {
      margin: 0;
      padding: 0;
    }
    h4 {
      font-weight: 600;
    }
    li {
      margin-left: 1rem;
      padding-left: 0;
      font-weight: 300;
    }
  `,
};

// eslint-disable-next-line
const DevTemplate = ({}: {}) => {
  const controls = controlsState((state) => state as controlsStateType);

  return (
    <InputGroup ss={styles.wrapper}>
      <Select
        ss="min-width:12rem"
        size="xs"
        placeholder={'Size presets'}
        value={controls.sizePresetKey}
        onChange={(value) => {
          controls.set_size(value);
        }}
        optionLabelProp="label"
        defaultValue={['usa']}
      >
        {Object.entries(controls.sizePresets).map(([key, value]) => (
          <Option key={key} value={key}>
            <Block ss={styles.option}>
              <h4>{key}</h4>
              <ul>
                {value.map(([w, h, notes]) => (
                  <li key={w + h}>{notes}</li>
                ))}
              </ul>
            </Block>
          </Option>
        ))}
      </Select>
    </InputGroup>
  );
};
export default memo(DevTemplate);
