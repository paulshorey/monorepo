import React, { memo } from 'react';
import styles from './styles';
import Frame from './Frame';
import ControlsUrl from './ControlsUrl';
import ControlsSizes from './ControlsSizes';
import ControlsBottom from './ControlsBottom';
import controlsState, { controlsStateType } from 'state/controlsState';

// eslint-disable-next-line
const DevTemplate = ({}: {}) => {
  const controls = controlsState((state) => state as controlsStateType);
  const host = controls.hosts[controls.hostIndex] || '';
  const sizes = controls.sizePresets[controls.sizePresetKey] || [];
  return (
    <div css={styles.wrapper}>
      <div css={styles.controlsTop}>
        <ControlsUrl />
        <span> &nbsp; </span>
        <ControlsSizes />
      </div>
      <ControlsBottom />
      <div className="frames" id="DevScreenSizesFrames">
        {sizes.map((size, i) => (
          <Frame
            id={'DevScreenSizesFrame' + i}
            host={host}
            path={controls.paths[controls.pathIndex]}
            frame={size}
            key={i}
          />
        ))}
      </div>
    </div>
  );
};
export default memo(DevTemplate);
