See the code: https://github.com/paulshorey/harmony/modules/fn. Clone the whole monorepo.

## A system for organizing utility functions - for use by multiple apps

> If something is missing, just add it. Then use it in any app in the future.

## Categories

- `/io` - **universal** pure functions, no side effects, no dependencies, immutable
- `/browser` - relies on the window, location, user agent, OS, screen size, etc.
- `/requests` - external HTTP calls rely on installed NPM dependencies such as `axios`
- `/server` - relies on server-side dependencies and variables like `process`, `env`, `fs`

> This is currently a work in progress. May have bugs and edge cases.  
> `/io` is universal, most mature, and has has full unit test coverage.
> `/browser` is stable but needs testing. `/requests` is experimental. `/server` only has one function but more bash/shell utilities will be added soon.

## How to use

Everything is tree-shakeable. Import only the function you need, not the entire collection.

```js
import is_ios from "@ps/fn/browser/device/is_ios";

is_ios(); // true if client is iPhone, iPod, iPad, or emulator
```

<br />

## Development:

This package is part of a monorepo. It relies on a couple sibling packages `@ps/constants` and `@ps/cconsole`.

1. Clone the entire monorepo: `git clone git@github.com:paulshorey/harmony.git mono`

### Enter the monorepo ROOT directory `cd ./mono`:

2. Install from the root monorepo directory. Yarn works better than npm: `yarn install`

### To edit the utility functions, now enter this project `cd ./modules/fn`:

3. Develop: `yarn run dev`

4. Run the tests in watch mode: `yarn run test:watch`

5. Run the tests: `yarn run test`

6. Build. Compile Typescript to ES6: `yarn run build`

### To update documentation, stay in the project directory:

7. Build documentation to `_docs` folder: `yarn run docs:build`

8. Open the documentation in a browser: `yarn run docs:serve`

<br />

## Maintenance:

### Install new NPM dependencies in the project directory (`cd ./modules/fn`)

Use the `-W` flag to install the new project dependency into the current project.

```
yarn add -W <package>
```

Use the `-D` flag to install the NPM module as a dev dependency.

```
yarn add -W -D <package>
```

<br />

## Notes

This is meant to be used in a monorepo by any JavaScript framework that supports ES Modules and ES2015+ (NodeJS on the server or Webpack/Babel/NextJS compiler on the client).

The goal of this is to keep a central repository of all the functions any website or application could ever need. Then each app can import only each little code snippet as needed - to keep the bundle size small.

In the future, when this is more mature, this module could be published as a standalone open-source NPM package for anyone anywhere to import to their own app. For now, just clone the entire mono-repo.

However, everyone's codebase has different needs and preferences. The challenge is to create a system that can be used by anyone, but also be customized to fit any project. So for now, I'm practicing organizing the code in my own repository, setting up standards and processes that in the future might meet the needs of a community of developers.

This has no affiliation with the <a href="https://harmonyjs.io/" target="_blank">HarmonyJS</a> framework. This will be called "Harmony UX", because it focuses on user experience and developer experience, rather than a specific programming technology.
