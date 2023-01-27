## Search.js manages mainly 2 state variables:

`${str}` and `${tld}`

- `tld` is the domain extension - the "com" in "willywonka.com"
- `str` is the search phrase - the 'willywonka' in 'willywonka.com'
  it also is used for the Thesaurus part of the app.

## Different types of state

- Search component (local state) - `this.state.str` and `this.state.tld`
  they are independent of the global states,
  until the user hits Enter or clicks Submit

- Redux (global state) - `input.str` and `input.tld`
  gets updated from local state when user hits Enter or Submit

- window.location or props.router.location (global state) - `?str=whatever&tld=com`
  must update whenever Redux state changes
  so, makes sense to update it within Redux

## Location

- **Page load**

  User loads page, with `str` and `tld` specified in `url location`.

  This is read in a Redux reducer file, and used to make the initial state.

- **User clicks link**

  User clicks some link, which updates the url... Actually, that's only how it looks.

  **Instead,** user clicks a `<span onClick={handler}>`, which calls a Redux action.
  The Redux action then updates the URL.

  **Do NOT use `<Link href=""/>` to update `${str}` or `${tld}` variables!** Instead, find the appropriate Redux action.
