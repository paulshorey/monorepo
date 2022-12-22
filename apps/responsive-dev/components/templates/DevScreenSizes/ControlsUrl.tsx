import React, { memo } from 'react';
import { css } from '@emotion/react';
import SelectAdd from '@ps/ui/components/SelectAdd';
import InputGroup from '@ps/ui/components/InputGroup';
import controlsState, { controlsStateType } from 'state/controlsState';

const style = css`
  width: 100%;
  > * {
    width: 100%;
  }
`;

// eslint-disable-next-line
const DevTemplate = ({}: {}) => {
  const controls = controlsState((state) => state as controlsStateType);
  const host = controls.hosts[controls.hostIndex];

  return (
    <InputGroup ss={style}>
      <SelectAdd
        ss="min-width:12rem !important;"
        size="xs"
        placeholder={'Select host'}
        addPlaceholder={'https://example.com'}
        values={controls.hosts}
        value={host}
        onAdd={(value) => {
          controls.set_host(value);
        }}
        onChange={(value) => {
          controls.set_host(value);
        }}
        onRemove={(value) => {
          controls.remove_host(value);
        }}
        validations={[
          {
            errorMessage: 'Please enter a value',
            regExp: /.+/,
          },
          {
            errorMessage: 'Please start with http:// or https://',
            regExp: /^(http|https):\/\//,
          },
          function (value) {
            // if mentions localhost, then must have correct protocol and port
            if (value.indexOf('localhost') > -1) {
              if (value.substring(0, 5) === 'https') {
                return 'Please use http:// for localhost';
              }
              if (!/(:[0-9]{2,12})/.test(value)) {
                return 'Please use a port number with localhost';
              }
            }
            return undefined;
          },
          {
            errorMessage: 'Invalid domain extension',
            regExp: /([.|:]{1})([a-z0-9]{2,12})$/,
          },
        ]}
      />
      <SelectAdd
        ss="min-width:12rem !important;"
        size="xs"
        placeholder={'Select path'}
        addPlaceholder={'/path/to/page'}
        values={controls.paths}
        value={controls.paths[controls.pathIndex]}
        onAdd={(value) => {
          controls.set_path(value);
        }}
        onChange={(value) => {
          controls.set_path(value);
        }}
        onRemove={(value) => {
          controls.remove_path(value);
        }}
        validations={[
          function (value) {
            if (controls.paths.length > 0 && !value) {
              return 'Please enter a value';
            }
            return undefined;
          },
        ]}
      />
    </InputGroup>
  );
};
export default memo(DevTemplate);
