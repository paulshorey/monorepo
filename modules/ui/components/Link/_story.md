Intelligently parses props and fills in missing props/attributes to ensure the rendered anchor tag is valid, uses correct \_target, has good accessibility, and uses the correct canonical domain/protocol. 

And makes sure the links are accessible by keyboard navigation (hit Tab to focus next link, hit Enter to click) and screen readers.

In order to be compatible with multiple frameworks, this component does not just import from Next.js or CreateReactApp. In your app, you must customize the theme - import from `next/link` or `react-router-dom`, and pass your router link component to `theme.LinkComponent`. This component will use the router link component in your theme. If none specified, this will just render a basic HTML `<a>` anchor tag.