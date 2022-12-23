import React from 'react';
import useShowStorybookCode from '@techytools/ui/hooks/useShowStorybookCode';
import CanvasContainer from '@techytools/ui/.storybook/components/CanvasContainer';
import { withBlock } from '@techytools/ui/components/Block';
import { withInline } from '@techytools/ui/components/Inline';
import CanvasStoryPadding from '@techytools/ui/.storybook/components/CanvasStoryPadding';
import Dropdown from '.';

export default function () {
  useShowStorybookCode();
  const Link = withInline({
    role: 'menuitem',
    className: 'notARealLink',
  });
  const Nav = withBlock({
    as: 'nav',
    ss: `
      display: flex;
      margin: 1rem 1rem 0.9rem 1rem;
      > * {
        display: inline-block;
        margin-right: 1rem;
        &:nth-child(3) {
          margin-right: 0;
        }
      }
    `,
  });
  const ToggleMenu = withBlock({
    componentName: 'ToggleMenu',
    textcolor: 'light',
    bggradient: 'purple',
    ss: `
      border-radius: 0.5rem;
      padding: 1rem;
      margin: 0;
      .notARealLink {
        display: block;
        padding: 0.25rem 0.5rem;
        margin: 0;
        color: inherit;
      }
    `,
  });
  return (
    <CanvasContainer bgcolor="light" textcolor="dark">
      <CanvasStoryPadding>
        <Nav>
          <Dropdown
            textcolor="cta"
            left
            menu={
              <ToggleMenu>
                <Link>align_left</Link>
                <Link>two</Link>
                <Link>three</Link>
                <Link>four</Link>
                <Link>five</Link>
              </ToggleMenu>
            }
          >
            align left
          </Dropdown>
          <Dropdown
            menu={
              <ToggleMenu>
                <div>
                  <Link>align_center</Link>
                  <Link>two</Link>
                  <Link>three</Link>
                  <Link>four</Link>
                  <Link>five</Link>
                </div>
              </ToggleMenu>
            }
          >
            align center
          </Dropdown>
          <Dropdown
            textcolor="accent"
            right
            menu={
              <ToggleMenu>
                <div>
                  <Link>align_right</Link>
                  <Link>two</Link>
                  <Link>three</Link>
                  <Link>four</Link>
                  <Link>five</Link>
                </div>
              </ToggleMenu>
            }
          >
            align right
          </Dropdown>
        </Nav>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
      </CanvasStoryPadding>
    </CanvasContainer>
  );
}

export const code = `import Dropdown from '@techytools/ui/components/Dropdown';
  
const ToggleMenu = withBlock({
  componentName: 'ToggleMenu', // for debugging in browser dev tools (otherwise it will be called "Block")
  textcolor: 'light',
  bggradient: 'purple',
  style: {}
});

<Dropdown
  textcolor="accent"
  right // shortcut: React will automatically pass {true}
  menu={
    <ToggleMenu>
      <div>
        <Link>align_right</Link>
        <Link>two</Link>
        <Link>three</Link>
        <Link>four</Link>
        <Link>five</Link>
      </div>
    </ToggleMenu>
  }
>
  align right
</Dropdown>
`;
