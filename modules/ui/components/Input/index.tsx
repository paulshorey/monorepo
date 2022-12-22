import React, {
  ReactNode,
  InputHTMLAttributes,
  forwardRef,
  memo,
  useEffect,
} from 'react';
import styleProps from '@ps/ui/types/styles';
import variants from '@ps/ui/components/Input/styles';
import { Input as AntInput, InputProps as AntInputProps } from 'antd';
import withCombinedProps from '@ps/ui/hooks/withCombinedProps';
import withStyles from '@ps/ui/hooks/withStyles';

export type Props = {
  /**
   * Used to set padding/fontSize/height/line-height.
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * If true, will have very rounded corners like a "pill" or "circle".
   */
  round?: boolean;
  /**
   * The prefix icon for the Input
   */
  prefix?: ReactNode;
  /**
   * The suffix icon for the Input
   */
  suffix?: ReactNode;
  /**
   * The max length
   */
  maxLength?: number;
  /**
   * The callback function that is triggered when Enter key is pressed
   */
  onPressEnter?: (e) => void;
  /**
   * If allow to remove input content with clear icon
   */
  allowClear?: boolean | { clearIcon: ReactNode };
  /**
   * NOT SUPPORTED YET. Will be added soon.
   *
   * Validate the input value. Check for a minimum length, or a specific pattern like starting with "https?://" or email address or anything.
   *
   * Pass validation object, or a string that refers to the key of a built-in validation function. For example, "email" will refer to `theme.validations.email` the value of which will be `{ regExp: RegExp; errorMessage: string; }`. TODO: manage predefined regexps in the site theme, then convert this type to a "keyof" enum.
   */
  validations?: Array<
    | {
        regExp: RegExp;
        errorMessage: string;
      }
    | string /* keyof predefined regexps in theme */
  >;
} & styleProps &
  Omit<
    Omit<InputHTMLAttributes<HTMLElement & HTMLInputElement>, 'size'>,
    'prefix'
  >;

/**
 * Input. Pass variant such as "primary", "outlined", "cancel", or "disabled"
 */
export const Component = (props: Props, ref: any) => {
  const { size, ...rest } = props;
  /**
   * Manage state here so this component can perform front-end validation before the form
   */
  const [value, set_value] = React.useState(props.value || '');
  useEffect(() => {
    set_value(props.value || '');
  }, [props.value]);
  return (
    <AntInput
      {...rest}
      value={value}
      onChange={(e) => {
        // console.log('onChange', e);
        set_value(e.target.value);
        if (props.onChange) {
          props.onChange(e);
        }
      }}
      onFocus={(e) => {
        // console.log('onFocus', e);
        if (props.onFocus) {
          props.onFocus(e);
        }
      }}
      data-hasvalue={!!value}
      ref={ref}
    />
  );
};

/*
 * (1) default export is normal component ready to use (2) withInput is HOC used to predefine common props
 */
const Styled: React.FC<Props> = withStyles(
  forwardRef(Component),
  'Input',
  variants
);

export default memo(Styled);

export const withInput = (props: Props) => withCombinedProps(Styled, props);
