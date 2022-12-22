Pass `props.variant` to change the layout. Default is `titleImageTextimage` - meaning title is on the top left cell, text is on the bottom left cell, and the image takes up 2 cells on the right.

On small screens, all content will be stacked vertically instead of in a grid.

IMPORTANT: title text and image must each contain exactly one React JSX child. DO NOT USE the React.Fragment <></>

IN STORYBOOK: the left sidebar takes away from the viewport width. So, this may be showing the mobile layout even though you're on desktop. Press <kbd>F</kbd> to toggle full width mode.
