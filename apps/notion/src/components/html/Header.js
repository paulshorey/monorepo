import propTypes from 'prop-types';
import { css, useTheme } from '@emotion/react';
import { composeCSS } from 'src/emotion/helperFunctions';
import { contentWidthFull } from 'src/components/html/css';

const presets = {
  header: (theme) => css`
    padding: 15px;
    border-bottom: solid 1px #ccc;
    ${contentWidthFull(theme)};
  `,
};

const Header = ({ tag, variant, variants, children, customCSS, className }) => {
  const theme = useTheme();
  const TagName = `${tag}`;
  return (
    <TagName
      className={className + ' htmlHeader'}
      css={composeCSS({ theme, tag, customCSS, variant, variants, presets })}
    >
      {children}
    </TagName>
  );
};

Header.defaultProps = {
  customCSS: css``,
  tag: 'header',
  className: '',
};

export default Header;
