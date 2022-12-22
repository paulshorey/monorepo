## This UI Library, Storybook testing app, styling system ...

It should work just fine with Tailwind, Ant Design, Bootstrap, etc. whatever uses class names to apply styles.

That's because this library can easily apply SCSS styles to a component. That SCSS can reach inside the component and style any of the children elements. It actually wraps its styles (the `ss`/`ssDesktop`/`ssPhone`/etc. props) in an extra selector to give itself a bit more specificity. That's because the generated classNames are not inline styles but regular classNames, so they lack specificity to over-ride a rule with a nested className.

### I just need to make sure that tree-shaking works in the library of choice, and this library itself too!

Then, the plan is to import components as needed from one or multiple libraries into this Storybook. Adjust styles. Allow them to be brandable. Document each in a Story. And of course set up testing for the new component (visual and functional).

### Here's a promising UI library

https://flowbite.com/docs/components/buttons/#gradient-outline

They use only global CSS/JavaScript though, not modular. So that's a commitment. I don't know if I like them that much to use all their components, and to have to import all their CSS/JavaScript on every page is my app only needs a few small components.

The title of this page is "Tailwind" but it really just means any class-name-based UI library. I have my doubts about the entire genre - because of the same reason - they all seem to require importing a large global stylesheet and JS file.

Ant design is very powerful and is in consideration. But it needs a lot of re-styling to make it brandable.

## Better option Meraki UI

Meraki UI
https://merakiui.com/
https://github.com/merakiui/merakiui

Its components are ready to use. Copy/paste. I'm just going to copy a bunch of them into this library. Then tweak the style and add interactive JavaScript functionality. Because they're each copy/paste, it means no extra overhead, no extra global files to include. Just Tailwind CSS.

### Free open-source Tailwind components libraries

Great thing about Tailwind is that it's simple enough to get started. So, it's gathered a huge community of design-minded people who have built awesome things for it and with it.
