import React from 'react';
import Block from '@techytools/ui/components/Block';
import { withBlock } from '@techytools/ui/components/Block';

const Container = withBlock({
  ss: `
  margin: 1.5rem 0;
  > * {
    font-size: 1rem;line-height:1.5rem;
  }

  b {
    color: var(--color-accent);
  }
`
});
const Border = withBlock({
  ss: `
  border:solid 1px var(--color-accent);
  padding: 1rem;
  border-radius: 8px;
`
});
const Mq = withBlock({
  as: 'code',
  ss: `
  text-indent: 1rem;
  opacity: 1 !important;
  span {
    color: var(--color-accent);
  }
  b {
    padding-left: 1rem;
    color: white;
    opacity: 0.75;
    font-weight: 400;
    font-size: 0.9rem;
  }
  // b::before {
  //   content: ' = \`/*   ';
  // }
  // b::after {
  // content: '   */ \`';
  // }
`,
});
const MediaQueriesDemo = () => (
  <Container>
    <Border>
    <code>{`<Component `}</code>
    <Mq>
      <span>ss</span> <b>all sizes</b>
    </Mq>
    <Mq>
      <span>ssLg</span> <b>min-width 931px </b>
    </Mq>
    <Mq>
      <span>ssSm</span> <b>max-width 930px</b>
    </Mq>
    <Mq>
      <span>ssDesktop</span> <b>min-width 1025px</b>
    </Mq>
    <Mq>
      <span>ssMobile</span> <b>max-width 1024px</b>
    </Mq>
    <Mq>
      <span>ssLargeTablet</span> <b>min-width 768px and max-width 1024px</b>
    </Mq>
    <Mq>
      <span>ssTablet</span> <b>min-width 601px and max-width 1024px</b>
    </Mq>
    <Mq>
      <span>ssNotPhone</span> <b>min-width 601px</b>
    </Mq>
    <Mq>
      <span>ssPhone</span> <b>max-width 600px</b>
    </Mq>
    <Mq>
      <span>ssSmallPhone</span> <b>max-width 400px</b>
    </Mq>
    <Mq>
      <span>ssTinyPhone</span> <b>max-width 360px</b>
    </Mq>
    <Mq>
      <span>ssLargeDesktop</span> <b>min-width 1440px</b>
    </Mq>
    <Mq>
      <span>ssVeryLargeDesktop</span> <b>min-width 1920px</b>
    </Mq>
    <Mq>
      <span>ssPortrait</span> <b>height &gt; width</b>
    </Mq>
    <Mq>
      <span>ssLandscape</span> <b>width &gt; height</b>
    </Mq>
    <code>/&gt;</code>
    </Border>

<p>Each <code>ss</code> prop one corresponds to a <code>theme.mq</code> property:</p>

<Border>
  <Mq>
    <span>theme.mq.lg</span> <b>min-width 931px </b>
  </Mq>
  <Mq>
    <span>theme.mq.sm</span> <b>max-width 930px</b>
  </Mq>
  <Mq>
    <span>theme.mq.desktop</span> <b>min-width 1025px</b>
  </Mq>
  <Mq>
    <span>theme.mq.mobile</span> <b>max-width 1024px</b>
  </Mq>
  <Mq>
    <span>theme.mq.largeTablet</span> <b>min-width 768px and max-width 1024px</b>
  </Mq>
  <Mq>
    <span>theme.mq.tablet</span> <b>min-width 601px and max-width 1024px</b>
  </Mq>
  <Mq>
    <span>theme.mq.notPhone</span> <b>min-width 601px</b>
  </Mq>
  <Mq>
    <span>theme.mq.phone</span> <b>max-width 600px</b>
  </Mq>
  <Mq>
    <span>theme.mq.smallPhone</span> <b>max-width 400px</b>
  </Mq>
  <Mq>
    <span>theme.mq.tinyPhone</span> <b>max-width 360px</b>
  </Mq>
  <Mq>
    <span>theme.mq.largeDesktop</span> <b>min-width 1440px</b>
  </Mq>
  <Mq>
    <span>theme.mq.veryLargeDesktop</span> <b>min-width 1920px</b>
  </Mq>
  <Mq>
    <span>theme.mq.portrait</span> <b>height &gt; width</b>
  </Mq>
  <Mq>
    <span>theme.mq.landscape</span> <b>width &gt; height</b>
  </Mq>
  </Border>

  </Container>
);

export default MediaQueriesDemo;
