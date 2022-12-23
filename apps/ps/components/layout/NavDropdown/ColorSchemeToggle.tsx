import { useState } from 'react';
import uiState, { uiStateType } from 'state/uiState';
import Button from '@techytools/ui/components/Button';

const style = ({ theme }) => `
  margin-left: 0.875rem; cursor:pointer; user-select: none;
  ${theme.mq.smallPhone} {
    display:none;
  }
  `;

const parse_colorSchemeLabel = (ui: uiStateType) => {
  const scheme = ui.colorSchemes[ui.colorSchemeIndex];
  if (scheme === 'light') {
    return `🌙`;
  }
  return `☀️`;
};

const ColorSchemeToggle = (props) => {
  const ui = uiState((state) => state as uiStateType);
  const [colorSchemeLabel, set_colorSchemeLabel] = useState(
    parse_colorSchemeLabel(ui)
  );
  const toggle_colorScheme = () => {
    ui.colorSchemeIndexToggle();
    set_colorSchemeLabel(parse_colorSchemeLabel(ui));
  };
  return (
    <Button
      ss={style}
      tabIndex={0}
      variant="text"
      {...props}
      onClick={toggle_colorScheme}
    >
      {colorSchemeLabel}
    </Button>
  );
};
export default ColorSchemeToggle;
