import React, { useState } from 'react';
import Highlight, { defaultProps, Language } from 'prism-react-renderer';
import themeDark from 'prism-react-renderer/themes/nightOwl';
import themeLight from 'prism-react-renderer/themes/nightOwlLight';
import Block from '@techytools/ui/components/Block';
import { faCode } from '@fortawesome/free-solid-svg-icons/faCode';
import { faCopy } from '@fortawesome/free-solid-svg-icons/faCopy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from '@emotion/styled';

export type PrismThemeType = typeof themeDark;

export type Props = {
  code: string;
  title?: string;
  language?: Language;
  prismTheme?: PrismThemeType;
  variant?: string;
  showNumbers?: boolean;
  collapsed?: boolean;
  copyable?: boolean;
};

const Code = ({
  title = '',
  code = '',
  language = 'jsx',
  prismTheme,
  variant = '',
  showNumbers = false,
  collapsed = false,
  copyable = false,
}: Props) => {
  // default = dark
  let theme;
  // pass variant="light" or variant="transparentLight" to use light theme
  if (variant === 'light' || variant === 'transparentLight') {
    theme = { ...themeLight, ...{ plain: { ...themeLight.plain } } };
  } else {
    theme = { ...themeDark, ...{ plain: { ...themeDark.plain } } };
  }
  // default theme
  if (variant === 'light') {
    theme.plain.backgroundColor = 'hsla(22deg 8% 88% / 0.99)';
  } else if (variant === 'transparentLight') {
    theme.plain.backgroundColor = 'hsla(33deg 8% 88% / 0.88)';
  } else if (variant === 'transparentDark') {
    theme.plain.backgroundColor = 'hsla(22deg 3% 9% / 0.67)';
  } else {
    theme.plain.backgroundColor = 'hsla(22deg 5% 15% / 0.95)';
  }
  // customize theme from props
  if (prismTheme) {
    theme = { ...theme, ...prismTheme };
  }

  const [collapsedState, set_collapsedState] = useState(collapsed || false);

  const ControlsTop: any = [];
  if (collapsed) {
    ControlsTop.push(
      <Block
        key="showhide"
        as="span"
        ss={`
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          z-index: 100;
          cursor: pointer;
          text-align: right;
        `}
        onClick={() => {
          set_collapsedState(!collapsedState);
        }}
      >
        <Block
          as="span"
          ss={`
            height: 1.95rem;
            line-height: 1.9rem;
            padding: 0 0.5rem;
            background: linear-gradient(
              to left,
              ${theme.plain.backgroundColor}
              transparent,
            );
            color: #efefef;
            border-radius: 0.5rem;
          `}
        >
          {collapsedState && 'show '}
          <FontAwesomeIcon icon={faCode} />
        </Block>
      </Block>
    );
  }
  let ControlsBottom: any = [];
  if (copyable) {
    ControlsBottom = (
      <Block
        key="copy"
        as="span"
        ss={`
          position: absolute;
          bottom: 0.05rem;
          right: 0;
          z-index: 100;
          opacity: 0.75;
          height: 1.95rem;
          line-height: 1.9rem;
          padding: 0 0.5rem;
          cursor: pointer;
          background: ${theme.plain.backgroundColor};
          color: #efefef;
          border-radius: 0.5rem;
        `}
        onClick={() => {}}
      >
        {collapsedState && 'copy '}
        <FontAwesomeIcon icon={faCopy} />
      </Block>
    );
  }
  // render
  return (
    <>
      {ControlsTop.length > 0 && ControlsTop}
      {!collapsedState && ControlsBottom.length > 0 && ControlsBottom}
      <Highlight
        {...defaultProps}
        theme={theme}
        code={code}
        language={language}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => {
          if (collapsedState) {
            style.height = '1.95rem';
            style.padding = '0.3rem 0.2rem 0.4rem 0';
            style.overflow = 'hidden';
          }
          style.transition = 'height: 1s, padding: 1s';
          return (
            <Pre className={className} style={style}>
              {title && (
                <Block
                  as="div"
                  ss={`
                  position:relative;
                  top: ${collapsedState ? '-0.3rem' : '-0.8rem'};
                  left: ${collapsedState ? '0.25rem' : '0'};
                  height: 1.95rem;
                  line-height: 1.9rem;
                  padding: 0 0.5rem;
                  background: linear-gradient(
                    to right,
                    transparent,
                    ${theme.plain.backgroundColor} 75%
                  );
                  color: rgb(99, 119, 119);
                  font-weight: 500;
                  border-radius: 0.5rem;
                `}
                >
                  {title}
                </Block>
              )}
              {tokens.map((line, i) => (
                <Line key={i} {...getLineProps({ line, key: i })}>
                  {showNumbers ? <LineNo>{i + 1}</LineNo> : <>&nbsp;</>}&nbsp;
                  <LineContent>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token, key })} />
                    ))}
                  </LineContent>
                </Line>
              ))}
            </Pre>
          );
        }}
      </Highlight>
    </>
  );
};

export default Code;

export const Wrapper = styled.div`
  font-family: sans-serif;
  text-align: center;
`;

export const Pre = styled.pre`
  text-align: left;
  margin: 1em 0;
  padding: 0.5em;
  overflow: scroll;

  & .token-line {
    line-height: 1.5em;
    height: 1.5em;
  }
`;

export const Line = styled.div`
  display: table-row;
`;

export const LineNo = styled.span`
  display: table-cell;
  text-align: right;
  padding-right: 1em;
  user-select: none;
  opacity: 0.5;
`;

export const LineContent = styled.span`
  display: table-cell;
`;
