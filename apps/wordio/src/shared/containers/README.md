# this vs this.props.that

In this `src/shared/containers` folder, every container folder will share `this` state.
The entry component, `index.js` or the one that `index.js` exports, will refer to it normally, as `this`.

**However, please note -**
Every component that is included shall be passed `that={this}`. Any child component that includes another child component from this `src/shared/containers` folder shall pass `that={that}`. Both `this` and `that` refer to `this` of the entry main `index` component.

Thus, every component/module in each `src/shared/containers/*` folder shall refer to the same `this` state/props/methods. So, the word "container" refers to the `/*` folder, not to the `*.js` file.

So, in the index/entry component, refer to props as `this.props`, but in the included child components, refer to them as `this.props.that.props`. Or, destructure `this.props.that` variable into just `that`. So, **refer to shared props as `that.props`**.

## Why???

This really simplifies and expedites development. No longer have to pass a hundred individual key/value pairs between components. Every component inside the folder shares state (local state of the index component) and props (Redux state and actions). This can be refactored later, but during active experimental development, this is proving to be essential to building the app quickly. No regrets yet.

### /components vs /containers

This is rule only applies inside this `src/shared/containers` folder. The sibling folder `src/shared/components` is standard React way of doing things. Do not extend this technique to those standard components.

Do place "pure" or "dumb" components into `src/shared/components`, then include them here. So, do use PropTypes in those helper components, and do pass each key/value pair to them as you would normally.

#### Why not????

The only reason this is not done, is that you can't search a file for a particular method or state variable. **Solution:** instead, search the entire folder for usage. Then, you will find `some_method`, where it's used, and where it's created. It should only be created in the `index`/`entry` component.**Child components should not add new methods to `this`/`that`.**

### Refactor

All this is experimental, and temporary, to expedite development. Should be refactored before code can be considered "stable".
