import Block from '@ps/ui/components/Block';
import Link from '@ps/ui/components/Link';
import useShowStorybookCode from '@ps/ui/hooks/useShowStorybookCode';
import CanvasStoryPadding from '@ps/ui/.storybook/components/CanvasStoryPadding';
import CanvasContainer from '@ps/ui/.storybook/components/CanvasContainer';

export default function (props) {
  useShowStorybookCode();
  return (
    <CanvasContainer>
      <p>
        <Link href="#" target="_blank" {...props}>
          Link
        </Link>{' '}
        component accepts all the props that an anchor tag would. Plus custom
        ones for analytics/tracking.
      </p>
      <p>
        Requires only <span data-textcolor="accent">props.href</span>
      </p>
      <p>
        <ul>
          <li>
            <span data-textcolor="accent">starts with #</span> - link to anchor
            on same page
          </li>
          <li>
            <span data-textcolor="accent">starts with mailto: or tel:</span> -
            link to open communication app
          </li>
          <li>
            <span data-textcolor="accent">starts with http.*</span> - link to
            external site in a new tab{' '}
          </li>
          <li>
            <span data-textcolor="accent">else</span> - link to internal page{' '}
          </li>
        </ul>
      </p>
      <Block bgcolor="light" textcolor="dark" ss="padding:0.25rem 0 0.5rem 0;">
        <p>
          <Link href="#" target="_blank" {...props}>
            Link
          </Link>{' '}
          component accepts all the props that an anchor tag would. Plus custom
          ones for analytics/tracking.
        </p>
        <p>
          Requires only <span data-textcolor="accent">props.href</span>
        </p>
        <ul>
          <li>
            <span data-textcolor="accent">starts with #</span> - link to anchor
            on same page
          </li>
          <li>
            <span data-textcolor="accent">starts with mailto: or tel:</span> -
            link to open communication app
          </li>
          <li>
            <span data-textcolor="accent">starts with http.*</span> - link to
            external site in a new tab{' '}
          </li>
          <li>
            <span data-textcolor="accent">else</span> - link to internal page{' '}
          </li>
        </ul>
      </Block>
    </CanvasContainer>
  );
}

export const code = `<Link href="https://example.com">
  This Link will add target="_blank" and rel="noopener noreferrer"
</Link>

// If the href url is to the same domain as the link is currently on, 
// it will make sure the domain matches your canonical URL meta tag.

// If using next/link, <a> tag and passHref will be added automatically.`;
