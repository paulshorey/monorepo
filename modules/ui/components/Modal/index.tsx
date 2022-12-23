import React, { memo, forwardRef } from 'react';
import MuiModal, { ModalProps } from '@mui/material/Modal';
import variants from './styles';
import withCombinedProps from '@techytools/ui/hooks/withCombinedProps';
import styleProps from '@techytools/ui/types/styles';
import withStyles from '@techytools/ui/hooks/withStyles';

export type Props = ModalProps & styleProps;

export const Component = (props: Props, ref?: any) => {
  const { open, onClose, children, ...rest } = props;
  return (
    <MuiModal
      ref={ref}
      disablePortal={true}
      // keepMounted={true}
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      {...rest}
    >
      {children}
    </MuiModal>
  );
};

/*
 * (1) default export is normal component ready to use (2) withModal is HOC used to predefine common props
 */
// @ts-ignore tsFix: test passing ref to @mui/material/Modal
const Styled: React.FC<Props> = withStyles(
  forwardRef(Component),
  'Modal',
  variants
);

export default memo(Styled);

export const withModal = (props: Props) =>
  memo(withCombinedProps(Styled, props));
