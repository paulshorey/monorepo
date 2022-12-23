import React from 'react';
import Modal from '.';
import Block from '@techytools/ui/components/Block';
import Button from '@techytools/ui/components/Button';
import Input from '@techytools/ui/components/Input';
import CanvasContainer from '@techytools/ui/.storybook/components/CanvasContainer';
import useShowStorybookCode from '@techytools/ui/hooks/useShowStorybookCode';
import CanvasStoryPadding from '@techytools/ui/.storybook/components/CanvasStoryPadding';

export default (props: any) => {
  useShowStorybookCode();
  const [isOpen, set_isOpen] = React.useState(false);
  const handleOpen = () => set_isOpen(true);
  const handleClose = () => set_isOpen(false);
  return (
    <CanvasContainer bggradient="light" textcolor="dark">
      <CanvasStoryPadding>
        <p>
          <Input placeholder="Hit Tab key to focus inside each field on this page." />
        </p>
        <p>
          <Input placeholder="Focus moves to the modal when opened." />
        </p>
        <Modal
          open={isOpen}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Block bggradient="purple" textcolor="light" ss="padding: 1.5rem;">
            <h2>This is a title inside the modal</h2>
            <p>
              This could be a bit of text for a quick dialog, or a whole article
              for the user to read and sign.
            </p>
          </Block>
        </Modal>
        <p>
          <Button
            data-color="rainbow"
            data-bggradient
            variant="outlined"
            onClick={handleOpen}
          >
            Open modal
          </Button>
        </p>
        <p>
          <Input placeholder="On close, focus returns to the previously focused element." />
        </p>
        <p>
          <Input placeholder="This way, everything is accessible." />
        </p>
      </CanvasStoryPadding>
    </CanvasContainer>
  );
};

export const code = `import Modal from '@techytools/ui/components/Modal';
  
const [isOpen, set_isOpen] = React.useState(false);
const handleOpen = () => set_isOpen(true);
const handleClose = () => set_isOpen(false);
  
<p>
  <Input placeholder="Focus moves to the modal when opened." />
</p>
<Modal
  open={isOpen}
  onClose={handleClose}
  aria-labelledby="modal-modal-title"
  aria-describedby="modal-modal-description"
  >
  <Block bgcolor="purple" textcolor="light">
    <h2>This is a title inside the modal</h2>
    <p>
      This could be a bit of text for a quick dialog, or a whole article
      for the user to read and sign.
    </p>
  </Block>
</Modal>
<p>
  <Button
    bgcolor="purple"
    bggradient="rainbow"
    textgradient="rainbow"
    onClick={handleOpen}
    variant="outlined"
  >
    Open modal
  </Button>
</p>
<p>
  <Input placeholder="On close, focus returns to the previously focused element." />
</p>`;
