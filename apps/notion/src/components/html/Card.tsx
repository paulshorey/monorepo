import { css, useTheme } from '@emotion/react';

const presets = {
  div: (theme) => css`
    padding: 15px;
    border: solid 1px #ccc;
    border-radius: 10px;
    background: #f9f9f9;
    overflow: auto;
  `,
};

const Card = ({ tag = 'div', children, className, ...props }) => {
  const theme = useTheme();
  const TagName = `${tag}`;
  return (
    <TagName className={className + ' htmlCard'} {...props}>
      {children}
    </TagName>
  );
};

export default Card;
