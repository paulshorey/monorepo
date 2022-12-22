import React, { Fragment } from 'react';
// import Block from '@ps/ui/components/Block';
import { withButton } from '@ps/ui/components/Button';
// import GithubFilled from '@ant-design/icons/GithubFilled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

export const Buttons = (props) => {
  const Button = withButton({
    size: 'sm',
    ss: 'margin: 0 0.875rem 0.875rem 0;',
  });
  return (
    <Fragment>
      <Button loading icon={<FontAwesomeIcon icon={faUser} />}>
        Loading
      </Button>
      <Button variant="outlined" icon={<FontAwesomeIcon icon={faUser} />}>
        Outlined
      </Button>
      <Button variant="text" icon={<FontAwesomeIcon icon={faUser} />}>
        Text
      </Button>
      <Button round icon={<FontAwesomeIcon icon={faUser} />}>
        Round
      </Button>
      <Button
        round
        variant="primary"
        icon={<FontAwesomeIcon icon={faUser} />}
      />
    </Fragment>
  );
};
