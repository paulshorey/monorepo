import CodeInline from '@ps/ui/components/CodeInline';
import Block from '@ps/ui/components/Block';
import CanvasContainer from '@ps/ui/.storybook/components/CanvasContainer';
import useShowStorybookCode from '@ps/ui/hooks/useShowStorybookCode';

export default (props) => {
  useShowStorybookCode();
  return (
    <CanvasContainer bggradient="light" textcolor="dark">
      <p data-textcolor="accent">
        Use{' '}
        <CodeInline
          {...props}
          code={`<CodeInline code="!@#$%^&*()" {...props} />`}
        />{' '}
        to display anything without having to escape each special character.
      </p>
      <p>
        You can also pass <CodeInline {...props}>props.children</CodeInline>,
        but then you'd have to escape special characters yourself.
      </p>
      <p>
        You could also add variants to this component, to give it more
        functionality. For example,{' '}
        <CodeInline variant="transparentBg" {...props}>
          props.variant="transparentBg"
        </CodeInline>
        , or{' '}
        <CodeInline variant="noBg" {...props}>
          props.variant="noBg"
        </CodeInline>
        , or{' '}
        <CodeInline variant="redacted" {...props}>
          props.variant="redacted"
        </CodeInline>
      </p>
      <p>
        If your{' '}
        <CodeInline variant="noBg" {...props}>
          props.children
        </CodeInline>{' '}
        contain un-escaped HTML elements, by default they will be styled
        semi-transparent{' '}
        <CodeInline variant="noBg" {...props}>
          opacity:0.5;
        </CodeInline>
        . So, you can do cool tricks like display types or annotaions next to
        the main content.
        <br />
        For example, this component accepts{' '}
        <CodeInline {...props}>
          props.children<span>: React.ReactNode</span>
        </CodeInline>{' '}
        or{' '}
        <CodeInline {...props}>
          props.code<span>: string</span>
        </CodeInline>
        .
      </p>
    </CanvasContainer>
  );
};

export const code = `import CodeInline from '@ps/ui/components/CodeInline';

<p color="accent">
  Use <CodeInline code={\`<CodeInline {...props} code="!@#$%^&*()" />\`} {...props} /> to display
  anything without having to escape each special character.
</p>
<p>
  You can also pass <CodeInline {...props}>props.children</CodeInline>, but then
  you'd have to escape special characters yourself.
</p>
`;
