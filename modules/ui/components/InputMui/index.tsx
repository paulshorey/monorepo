import React, { forwardRef, memo, ReactElement } from 'react';
import { styleProps } from '@ps/ui/types/styles';
import variants from './styles';
import IconLoading from '@ant-design/icons/LoadingOutlined';
import withCombinedProps from '@ps/ui/hooks/withCombinedProps';
import withStyles from '@ps/ui/hooks/withStyles';
import InputAdornment from '@mui/material/InputAdornment';
import MuiInput, { InputProps as MuiInputProps } from '@mui/material/Input';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons/faCircleXmark';

export type Props = {
  /**
   * Used to set padding/fontSize/height/line-height.
   */
  // size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * If true, will have very rounded corners like a "pill" or "circle".
   */
  // round?: boolean;
  /**
   * Pass true to use default loading animation. Or pass a custom loading animation component.
   * If button has children, loading animation will play on top of the children.
   * This way, if loading prop is dynamic (after user clicked submit), button size will not change.
   */
  // loading?: boolean | ReactElement;
  /**
   * React component to displayed to the left of the text.
   */
  icon?: ReactElement;
  /**
   * True to show deault loading spinner. Or pass a custom loading spinner component.
   */
  loading?: boolean | ReactElement;
  /**
   * React component to displayed to the right of the text.
   */
  suffix?: ReactElement;
  /**
   * Alternative to `props.children`, will overwrite `props.children`.
   */
  value?: string | number;
  /**
   * Treated same as value. This will still be a controlled component. But if props.value is passed, it will override props.defaultValue.
   */
  defaultValue?: string | number;
  /**
   * If true, will show a "x" button suffix to clear the input value. NOTE: this will only work if there is no suffix. Passing props.suffix will disable this feature.
   */
  allowClear?: boolean;
} & styleProps &
  MuiInputProps;

/**
 * Input. Pass variant such as "primary", "outlined", "cancel", or "disabled"
 */
export const Component = (props: Props, ref: any) => {
  const {
    onChange,
    loading,
    allowClear,
    defaultValue: defaultValueProp,
    value: valueProp,
    inputProps = {},
    ...rest
  } = props;
  const defaultValue = valueProp || defaultValueProp;
  const noValue = typeof defaultValue === 'number' ? 0 : '';
  const [value, set_value] = React.useState(defaultValue);

  const InputProps: any = {};
  // icon on the left
  if (props.icon) {
    InputProps.startAdornment = (
      <InputAdornment position="start">{props.icon}</InputAdornment>
    );
  }
  // icon on the right
  if (loading) {
    InputProps.startAdornment = (
      <InputAdornment position="end">
        {loading === true ? <IconLoading /> : loading}
      </InputAdornment>
    );
  }
  if (props.prefix) {
    InputProps.startAdornment = (
      <InputAdornment position="start">{props.prefix}</InputAdornment>
    );
  }
  if (value && allowClear) {
    InputProps.endAdornment = (
      <InputAdornment position="end">
        <FA
          icon={faCircleXmark}
          onClick={() => {
            set_value(noValue);
            ref.current.focus();
          }}
        />
      </InputAdornment>
    );
  }
  if (props.suffix) {
    InputProps.endAdornment = (
      <InputAdornment position="end">{props.suffix}</InputAdornment>
    );
  }
  ref = React.useRef(ref || null);
  return (
    <MuiInput
      inputRef={ref}
      onChange={(e) => {
        set_value(e.target.value);
        if (onChange) {
          onChange(e);
        }
      }}
      value={value}
      helperText="Incorrect entry."
      inputProps={inputProps}
      {...rest}
      {...InputProps}
    />
  );
};

/*
 * (1) default export is normal component ready to use (2) withInput is HOC used to predefine common props
 */
const Styled: React.FC<Props> = withStyles(
  forwardRef(Component),
  'InputMui',
  variants
);

export default memo(Styled);

export const withInput = (props: Props) =>
  memo(withCombinedProps(Styled, props));
