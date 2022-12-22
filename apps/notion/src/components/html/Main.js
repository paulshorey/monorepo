import propTypes from 'prop-types';
import { css, useTheme } from '@emotion/react';
import { composeCSS } from 'src/emotion/helperFunctions';
import { contentWidthFull } from 'src/components/html/css';

const presets = {
  main: (theme) => css``,
  full: (theme) => css`
    ${contentWidthFull(theme)};
  `,
};

const Main = ({ tag, variant, variants, children, customCSS, className }) => {
  const theme = useTheme();
  const TagName = `${tag}`;
  return (
    <TagName
      className={className + ' htmlMain'}
      css={composeCSS({ theme, tag, customCSS, variant, variants, presets })}
    >
      {children}
    </TagName>
  );
};

Main.defaultProps = {
  customCSS: css``,
  tag: 'main',
  className: '',
};

export default Main;
