import React from 'react';
import useShowStorybookCode from '@techytools/ui/hooks/useShowStorybookCode';
import CanvasContainer from '@techytools/ui/.storybook/components/CanvasContainer';
import CanvasStoryPadding from '@techytools/ui/.storybook/components/CanvasStoryPadding';
import Block from '.';
import CodeInline from '../CodeInline';

const style = (props) => `
  padding: 1px 1.25rem 0.25rem 1.5rem;
  code: {
    color: var(--color-accent),
  }
`;

export default function (props) {
  useShowStorybookCode();
  return (
    <CanvasContainer>
      <CanvasStoryPadding>
        <Block ss={style} {...props}>
          <p>
            A container for displaying any kind of content. The only default
            styles are{' '}
            <CodeInline
              variant="text"
              textcolor="accent"
              code={`position:relative;`}
            />{' '}
            and{' '}
            <CodeInline
              variant="text"
              textcolor="accent"
              code={`display:block;`}
            />
            . To set custom styles, pass{' '}
            <CodeInline variant="text" textcolor="accent" code={`props.ss`} />{' '}
            (string/function handled by Emotion, converted to reusable
            namespaced className) or{' '}
            <CodeInline
              variant="text"
              textcolor="accent"
              code={`props.style`}
            />{' '}
            (JS object applied as inline style to DOM element) .
          </p>
          <p>
            By default, Block renders a <code>div</code> element. Pass{' '}
            <CodeInline variant="text" textcolor="accent" code={`props.as`} />{' '}
            to render any other HTML tag.
          </p>
          <p>
            The main reason to use <code>Block</code> vs <code>div</code> is to
            utilize the <code>ss</code> and other custom props described in the
            table below.
          </p>
        </Block>
      </CanvasStoryPadding>
    </CanvasContainer>
  );
}

export const code = `import Block from '@techytools/ui/components/Block';

const style = \`
  padding: 1px 1.25rem 0.25rem 1.5rem;
  code: {
    color: var(--color-accent),
  }
\`

<Block className="card articleX" textcolor="purple" bggradient="light" ss={style}> 
  <p>
    The most basic building block. Used as a "container" for styling
    content. Use any <code>ss</code> props documented in the table below 👇.
  </p>
  <p>
    The className is not specific to this component. It can be applied to anything. 
    Defined globally in <code>styles/global/classes.css</code>.
  </p>
</Block>`;
