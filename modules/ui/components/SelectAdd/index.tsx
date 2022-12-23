import React, { memo, useState, forwardRef } from 'react';
import Select, {
  Props as SelectProps,
  Option,
} from '@techytools/ui/components/Select';
import styles from './styles';
import Button from '@techytools/ui/components/Button';
import Input from '@techytools/ui/components/Input';
import InputGroup from '@techytools/ui/components/InputGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faAdd } from '@fortawesome/free-solid-svg-icons';
import variants from '@techytools/ui/components/InputGroup/styles';
import withCombinedProps from '@techytools/ui/hooks/withCombinedProps';
import withStyles from '@techytools/ui/hooks/withStyles';

export type Props = {
  /**
   * Input element placeholder - when typing a new value.
   */
  addPlaceholder?: string;
  /**
   * When user adds new value, this function is called.
   */
  onAdd?: (value: string) => void;
  /**
   * Required. Instead of options (which contain value/label pairs), this componet takes a simple array of strings. The value and label are the same. Numbers may also be supported in the near future.
   */
  values: string[];
  /**
   * If provided, this function will be called when user clicks on the option "X" button to delete one of the options. Then, a "X" button will be shown to the right of each option.
   */
  onRemove?: (value: string) => void;
  /**
   * Pass validation object with regExp. Or a function which accepts the value. If it returns a non-empty string, then it will be shown as an error message.
   *
   * Or pass a string key referring to predefined validations in the theme. THIS IS NOT IMPLEMENTED YET.
   */
  validations?: Array<
    | {
        regExp: RegExp;
        errorMessage: string;
      }
    | string /* keyof predefined regexps in theme */
    | ((value: string) => string | undefined)
  >;
} & Omit<SelectProps, 'options'>;

/**
 * Select component (reused from this library) + type to add new item.
 */
export const Component = (props: Props, ref: any) => {
  const { ss, values, addPlaceholder, onAdd, onRemove, validations, ...rest } =
    props;
  const [errorMessage, set_errorMessage] = useState('');
  const [addNewValue, set_addNewValue] = useState('');

  if (rest.showSearch) {
    if (!rest.optionFilterProp) {
      rest.optionFilterProp = 'children';
    }
    if (!rest.filterOption) {
      rest.filterOption = (input, option) =>
        (option?.label + '').toLowerCase().includes(input.toLowerCase());
    }
  }

  const handleAddChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    set_errorMessage('');
    set_addNewValue(event.target.value);
  };

  const handleAddSubmit = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (validations) {
      for (const val of validations) {
        if (typeof val === 'string') {
          // use predefined validation from library
        } else if (typeof val === 'function') {
          // call validation function
          const errorMessage = val(addNewValue);
          if (errorMessage) {
            set_errorMessage(errorMessage);
            return;
          }
        } else {
          // execute custom passed reg exp
          if (val.regExp) {
            if (!val.regExp.test(addNewValue)) {
              set_errorMessage(val.errorMessage);
              return;
            }
          }
        }
      }
    } else if (!addNewValue) {
      set_errorMessage('Please enter a value');
      return;
    }
    if (onAdd) {
      onAdd(addNewValue);
    }
    set_addNewValue('');
  };

  // const Select = withSelect(rest);
  return (
    <Select
      {...rest}
      ss={[styles.wrapper, ss]}
      dropdownRender={(menu) => (
        <>
          {menu}
          <InputGroup
            style={{
              paddingLeft: '1px',
              paddingTop: '4px',
            }}
          >
            <Input
              size={props.size}
              placeholder={addPlaceholder || 'Add new item...'}
              value={addNewValue}
              onChange={handleAddChange}
              onPressEnter={handleAddSubmit}
            />
            <Button
              size={props.size}
              icon={<FontAwesomeIcon icon={faAdd} />}
              onClick={handleAddSubmit}
            />
          </InputGroup>
          {!!errorMessage && (
            <sup
              style={{
                padding: '0 0 0 4px',
                fontSize: '0.85em',
                opacity: '0.85',
                color: 'var(--color-error, red)',
              }}
            >
              {errorMessage}
            </sup>
          )}
        </>
      )}
    >
      {/*
       * Ant Select dropdown options dont re-render when state changes, only when props change.
       * This is because the dropdown is separated from the component.
       * So, for Options to update, state has to be managed externally to this component.
       */}
      {values.map((value) => (
        <Option key={value} value={value} ss={styles.option}>
          {value}
          {onRemove && (
            <>
              {' '}
              <Button
                size={props.size}
                variant="outline"
                ss={styles.optionRemove}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onRemove(value);
                }}
              >
                <FontAwesomeIcon icon={faClose} />
              </Button>
            </>
          )}
        </Option>
      ))}
    </Select>
  );
};

/*
 * (1) default export is normal component ready to use (2) withSelect is HOC used to predefine common props
 */
const Styled: React.FC<Props> = withStyles(
  forwardRef(Component),
  'SelectAdd',
  variants
);

export default memo(Styled);

export const withSelectAdd = (props: Props) =>
  memo(withCombinedProps(Styled, props));
