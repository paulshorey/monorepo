# Web Monorepo

Multiple web apps, sites, and modules in one place. No more publishing individual packages, and figuring out which version numbers are compatible betwee packages/apps. Better code sharing, global code standards, and a consistent developer experience. 

<br />

## What's inside?

### Front-end 
`./frontend` Next/React apps, built with TypeScript, styled with Emotion.  
- 📦 `ps` - [paulshorey.com](https://paulshorey.com) personal website
- 📦 `ui` - [ui.paulshorey.com](https://ui.paulshorey.com) React component library + Storybook documentation
- 📦 `notion` - [techy.tools](https://techy.tools) experimental documentation site builder using notion.so API
- 📦 `responsive-dev` - [responsive.paulshorey.com](https://responsive.paulshorey.com) a dev tool to help with responsive design and development

### Back-end 
`./backend` Node apps, written in Typescript. Served using `ts-node`.  
- 📦 `nlp` - API server powers wordio.co and besta.domains - simple narrow AI for sentiment analysis, semantic search, and generating short phrases

### Full-stack
`./fullstack` Helpers. Imported by other packages.  
- 📦 `constants` - constants and data
- 📦 `fn` - utility functions (`./fullstack/fn/io` are universal pure functions like lodash, there's also `browser`, `server`, and `request`)
- 📦 `cconsole` - console logging with colors, cloud provider (LogDNA/DataDog) integration, and other useful features

<br />

## Code quality:
Still a work in progress for all modules. Here's the plan:

### Testing
- [TypeScript](https://www.typescriptlang.org/) for static type checking (compiled by Webpack on front-end, and [ts-node](https://typestrong.org/ts-node/docs/) on back-end)
- [Storybook](https://storybook.com) for UI previews, code snapshot testing, and image snapshot testing
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) for testing React components in Jest
- [React Hooks Testing Library](https://react-hooks-testing-library.com/) for testing React Hooks in Jest
- [TS Node Test](https://github.com/meyfa/ts-node-test) allows using the built-in Node test runner for Typescript
- [Node built-in test runner](https://nodejs.org/dist/latest-v18.x/docs/api/test.html) is very new, runs unit tests with a familiar [assertion testing](https://nodejs.org/dist/latest-v18.x/docs/api/assert.html) syntax similar to Jest/Mocha. Built-in to NodeJS version 18.12, so does not require external packages! Works with [ts-node](https://typestrong.org/ts-node/docs/) which runs Typescript directly in NodeJS. No need to transpile to JS first. Resolves ES Modules more reliably with Typescript.

### Linting
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Husky](https://typicode.github.io/husky/#/) for linting/formatting/testing on commit
- [Commit Lint](https://github.com/conventional-changelog/commitlint) for creating meaningful commit messages based on [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) 

#### Automation
- [Git Actions](https://docs.github.com/en/actions) for testing before a Pull Request
- [Jenkins](https://www.jenkins.io/) for running automations with Cypress and BrowserStack
- [Standard Version](https://github.com/conventional-changelog/standard-version) for managing deployment tags and generating a changelog

<br />

## Using local packages
> after the Initial Setup (below) is done

#### Install new dependencies

- **To install a new NPM package for one of the apps/packages, run `yarn add -W <package-name>` while inside the app/package directory.** _This will install the package in the root `node_modules` folder and symlink it to the app/package that needs it. 

#### Import a package to your app
Packages may be shared between all apps/packages in the repo. It's important to note that any global package changes may affect other apps.

All shared packages must follow this naming syntax: `@ps/*package-name`


Include it in your `package.json`:
```
"dependencies": {
    "@techytools/ui": "*",
    ...
 }
```
Then import it like a normal NPM package. Local packages support (and encourage) tree shaking:
```
import Button from '@techytools/ui/component/Button'
```

#### Sometimes, config files use CommonJS. It works there too:
```
module.exports = require('@techytools/constants/prettier-preset');
```

<br />

## Initial Setup:

### Clone the repository

`git clone git@github.com:paulshorey/harmony.git`

### Install dependencies

`yarn` (or `yarn install`). It works better than `npm install`. **Run this from the root of the monorepo!**

#### Build

To build all apps and packages, run `yarn build` from the monorepo root.

To build a single app or package, `cd` into the package directory, then run `yarn build`.

### Develop

To develop all apps and packages, run `yarn dev` from the monorepo root.

To develop a single app or package, `cd` into the package directory, then run `yarn dev`.

### Test

To test all apps and packages, run `yarn test` from the monorepo root.

To test a single app or package, `cd` into the package directory, then run `yarn test`.

To perform image snapshot updates on a front-end package that supports it, run the following command:

```
cd apps/{your-app}
yarn storybook
yarn test -u
```

<br />

## Contributing

Here's a good standard for writing commit messages: https://github.com/greenkeeperio/monorepo-definitions/blob/master/CONTRIBUTING.md#examples

This repo will use [Commit Lint](https://commitlint.js.org/#/) to enforce commit syntax in the following format:

```
type: build chore ci docs feat fix perf refactor revert style test
scope (app/package): cms consumer nonprofit ui utils config
message: your git commit message
issue (Jira issue): SW2-123
```

This means that to commit you must add a commit message matching this format:

```
type(scope): message (SW2-1234)

ie. feat(consumer): added new feature (SW2-123)
```

Also included is a yarn script that can be run from the root of the app to walk you through:

```
yarn commit

```

<br />

## Deployment 🚀

All apps and APIs are set up to deploy themselves automatically whenever the monorepo codebase is pushed to Git.
* staging - will deploy when new code pushed to the `staging` branch
* production - will deploy when new code pushed to the `main` branch

Because of this, test and build scripts for ALL apps/apis must run successfully before deploying a change to any one package. Automation of this is still a work in progress.

### Submodules
Some of these packages could be managed as submodules, not part of this repo, but linked to a folder just like any other module. This can provide more control over deployment - allow some packages to be deployed to production without deploying all projects.  

### Alternative: manual deployment
A more advanced strategy for deployment than just automatically deploying everything for every change. Best for enterprise/teams (I'm just one person, so just keeping it simple). It is possible by having separate dev/staging/production branches for each project. Each team can merge their changes into each branch variant, essentially keeping the benefits of a monorepo architecture and also keeping the ability to deploy each project independently.

<br />

## Advanced setup 💪

- [Pipelines](https://turborepo.org/docs/features/pipelines)
- [Caching](https://turborepo.org/docs/features/caching)
- [Remote caching](https://turborepo.org/docs/features/remote-caching)
- [Scoped tasks](https://turborepo.org/docs/features/scopes)
- [Configuration options](https://turborepo.org/docs/reference/configuration)
- [CLI usage](https://turborepo.org/docs/reference/command-line-reference)
- [Build optimization](https://medium.com/@sppatel/maximizing-job-parallelization-in-ci-workflows-with-jest-and-turborepo-da86b9be0ee6j)