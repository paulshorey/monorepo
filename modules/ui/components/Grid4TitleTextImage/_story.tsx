import React from 'react';
import Grid from '.';
import Block from '@ps/ui/components/Block';
import useShowStorybookCode from '@ps/ui/hooks/useShowStorybookCode';

const Story = (props) => {
  useShowStorybookCode();
  return (
    <Block textcolor="light" bggradient="purple">
      <Grid
        variant={'titleImageTextImage'}
        className="articleX"
        image={
          <img src="https://cdn.mqtatic.net/Img/teams/teams-illo-free-sidebar-promo.svg?v=47faa659a05e" />
        }
        text={
          <p>
            On desktop, this text is shown left of the image. <br /> But on
            mobile, this is rendered below the image.{' '}
          </p>
        }
        title={<h1>This is the title</h1>}
        {...props}
      />
    </Block>
  );
};

export default Story;
export const code = `<Block textcolor="light" bggradient="purple">
  <Grid
    variant={'titleImageTextImage'}
    className="articleX"
    image={
      <img src="https://cdn.example.sh/some/picture.jpg" />
    }
    text={
      <p>
        On desktop, this text is shown left of the image. <br /> But on
        mobile, this is rendered below the image.{' '}
      </p>
    }
    title={<h1>This is the title</h1>}
    {...props}
  />
</Block>
`;
