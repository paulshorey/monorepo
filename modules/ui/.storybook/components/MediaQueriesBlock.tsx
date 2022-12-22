import React from 'react';
import Block from '@ps/ui/components/Block';
import { withBlock } from '@ps/ui/components/Block';

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
    <code>{`<Block `}</code>
    <Mq>
      ss <b>all sizes</b>
    </Mq>
    <Mq>
      ssLg <b>min-width 931px </b>
    </Mq>
    <Mq>
      ssSm <b>max-width 930px</b>
    </Mq>
    <Mq>
      ssDesktop <b>min-width 1025px</b>
    </Mq>
    <Mq>
      ssMobile <b>max-width 1024px</b>
    </Mq>
    <Mq>
      ssLargeTablet <b>min-width 768px and max-width 1024px</b>
    </Mq>
    <Mq>
      ssTablet <b>min-width 601px and max-width 1024px</b>
    </Mq>
    <Mq>
      ssNotPhone <b>min-width 601px</b>
    </Mq>
    <Mq>
      ssPhone <b>max-width 600px</b>
    </Mq>
    <Mq>
      ssSmallPhone <b>max-width 400px</b>
    </Mq>
    <Mq>
      ssTinyPhone <b>max-width 360px</b>
    </Mq>
    <Mq>
      ssLargeDesktop <b>min-width 1440px</b>
    </Mq>
    <Mq>
      ssVeryLargeDesktop <b>min-width 1920px</b>
    </Mq>
    <Mq>
      ssPortrait <b>height &gt; width</b>
    </Mq>
    <Mq>
      ssLandscape <b>width &gt; height</b>
    </Mq>
    <code>&gt;</code>
    </Border>

<p>Each <code>ss</code> prop one corresponds to a <code>theme.mq</code> property:</p>

<Border>
  <Mq>
    theme.mq.lg <b>min-width 931px </b>
  </Mq>
  <Mq>
    theme.mq.sm <b>max-width 930px</b>
  </Mq>
  <Mq>
    theme.mq.desktop <b>min-width 1025px</b>
  </Mq>
  <Mq>
    theme.mq.mobile <b>max-width 1024px</b>
  </Mq>
  <Mq>
    theme.mq.largeTablet <b>min-width 768px and max-width 1024px</b>
  </Mq>
  <Mq>
    theme.mq.tablet <b>min-width 601px and max-width 1024px</b>
  </Mq>
  <Mq>
    theme.mq.notPhone <b>min-width 601px</b>
  </Mq>
  <Mq>
    theme.mq.phone <b>max-width 600px</b>
  </Mq>
  <Mq>
    theme.mq.smallPhone <b>max-width 400px</b>
  </Mq>
  <Mq>
    theme.mq.tinyPhone <b>max-width 360px</b>
  </Mq>
  <Mq>
    theme.mq.largeDesktop <b>min-width 1440px</b>
  </Mq>
  <Mq>
    theme.mq.veryLargeDesktop <b>min-width 1920px</b>
  </Mq>
  <Mq>
    theme.mq.portrait <b>height &gt; width</b>
  </Mq>
  <Mq>
    theme.mq.landscape <b>width &gt; height</b>
  </Mq>
  </Border>

<Block as="h2" ss="margin-top:4rem;">Too many keys? Just keep it simple. Use pairs... &nbsp;&nbsp;&nbsp;</Block>

<p>
<Block as="ul" ss="padding-left:1rem;li:not(:last-child) {margin-bottom: 0.75rem;}">
  <li><><b>sm</b> / <b>lg</b> styles for min/max <b>930px</b> width</> <br />is the easiest strategy. Small tablets show the mobile design. Large tablets are treated as desktop.</li>
  <li><><b>phone</b> / <b>tablet</b> / <b>desktop</b></> is perfect if you have separate designs for all 3 environments.</li>
  <li><><b>mobile</b> vs <b>desktop</b> for min/max <b>1024px</b></> could work, but anyone using a tablet will get the mobile design.</li>
  </Block>
</p>
<p>
  You can occasionally use <b>largeDesktop</b>, <b>largeTablet</b>, <b>smallPhone</b>  or <b>tinyPhone</b> to adjust for edge cases. But you won't have to remember all the breakpoints for every style. Each is available only if you need it.
  </p>

  </Container>
);

export default MediaQueriesDemo;
