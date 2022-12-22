import React, { memo, HTMLAttributes, forwardRef } from 'react';
import CodeComponent, { Props as CodeProps } from './Code';
import styleProps from '@ps/ui/types/styles';
import withCombinedProps from '@ps/ui/hooks/withCombinedProps';
import variants from './styles';
import withStyles from '@ps/ui/hooks/withStyles';

export type Props = CodeProps & styleProps & HTMLAttributes<HTMLDivElement>;

export const Component = (props: Props, ref: any) => {
  const {
    variant,
    title,
    code,
    collapsed,
    showNumbers,
    language,
    prismTheme,
    ...rest
  } = props;
  return (
    <div ref={ref} {...rest}>
      <CodeComponent
        title={title}
        code={code}
        variant={variant}
        language={language}
        prismTheme={prismTheme}
        showNumbers={showNumbers}
        collapsed={collapsed}
      />
    </div>
  );
};

/*
 * (1) default export is normal component ready to use (2) withCode is HOC used to predefine common props
 */
const Styled: React.FC<Props> = withStyles(
  forwardRef(Component),
  'Code',
  variants
);

export default memo(Styled);

export const withCode = (props: Props) =>
  memo(withCombinedProps(Styled, props));
