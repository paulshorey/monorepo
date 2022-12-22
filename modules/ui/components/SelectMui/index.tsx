import React, { memo } from 'react';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import SelectMuiImport from '@mui/material/Select';
import type { SelectProps } from '@mui/material/Select/Select';
import variants from '@ps/ui/components/SelectMui/styles';
import withCombinedProps from '@ps/ui/hooks/withCombinedProps';
import withStyles from '@ps/ui/hooks/withStyles';

export type Props = {
  helperText?: string;
} & SelectProps;

/**
 * SelectMui
 */
export const Component = (props: Props) => {
  const {
    label = undefined,
    value,
    onChange,
    children,
    helperText,
    ...rest
  } = props;
  return (
    // @ts-ignore - experimental component
    <FormControl fullWidth {...rest} size="small">
      {label && (
        <InputLabel
        // id="demo-simple-select-label"
        >
          {label}
        </InputLabel>
      )}
      <SelectMuiImport
        // labelId="demo-simple-select-label"
        label={label}
        value={value}
        onChange={onChange}
      >
        {children}
      </SelectMuiImport>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

/*
 * (1) default export is normal component ready to use (2) withSelectMui is HOC used to predefine common props
 */
// @ts-ignore - experimental component
const Styled: React.FC<Props> = withStyles(Component, 'SelectMui', variants);

export default memo(Styled);

export const withSelectMui = (props: Props) =>
  memo(withCombinedProps(Styled, props));
