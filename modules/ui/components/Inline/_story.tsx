import useShowStorybookCode from '@techytools/ui/hooks/useShowStorybookCode';
import CanvasContainer from '@techytools/ui/.storybook/components/CanvasContainer';
import Block from '@techytools/ui/components/Block';
import { withInline } from '@techytools/ui/components/Inline';
import CanvasStoryPadding from '@techytools/ui/.storybook/components/CanvasStoryPadding';

export default function (props) {
  useShowStorybookCode();
  const Heading = withInline({
    as: 'h2',
    ss: 'margin:0;',
  });
  const Code = withInline({
    as: 'code',
  });
  return (
    <CanvasContainer bgcolor="light" textcolor="dark">
      <CanvasStoryPadding>
        <Block>
          Text can be used <Heading {...props}> as="h2"</Heading>, or{' '}
          <Code {...props}> as="&lt;code&gt;"</Code>, or as almost any other
          HTML element. By default, it's a span.
        </Block>
        <Block>
          But if you need to display inline code, use <code>CodeInline</code>{' '}
          component, because that has more functionality. This{' '}
          <code>Inline</code> component is mostly just used for custom style
          props. See all available props below.
        </Block>
      </CanvasStoryPadding>
    </CanvasContainer>
  );
}

export const code = `import Inline from '@techytools/ui/components/Inline';

Text can be used <Inline as="h2" textgradient="purple"> as h2</Inline>, or <Inline as="code" textgradient="purple"> as &lt;code&gt;</Inline>, or as any other HTML container element. By default, it's a span.
`;
