# Content

Maybe I'm a dreamer, but I believe CSS and JS can live in harmony. So can web development and software engineering.

I notice many software engineers say "no global stylesheets", "no global class names". But lets not be extreme. Why not?

This library uses a very tiny [5kb] global stylesheet. Only for colors of text, backgrounds, light vs dark schemes.

The problem is that many "CSS-in-JS" techniques try to suppress and repress CSS, to recreate its functionality in JavaScript. Instead, this framework embraces "CSS-and-JS". CSS can be free to live where it chooses (in a stylesheet) and do what it wants (style children components, or access classNames/attributes of a parent/grandparent). But it knows its boundaries. In this framework, CSS is used to manage colors and styles that are related to colors (like gradients, underlines, hover, dark/light backgrounds). Its much less work. Now the developer doesn't have to specify every little detail in every element. Now you can apply a color or scheme to an element, and all its children will be affected. This sounds scary to programmers, but don't be afraid. It won't mess up any layout or have name conflicts. In this library, CSS and JS work together, not against each other.

The "C" in "CSS" stands for "cascading"
