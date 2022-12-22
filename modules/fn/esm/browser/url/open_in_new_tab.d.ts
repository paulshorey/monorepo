/**
 * Open a url in a new tab with support from all browsers.
 * Note: safari views window.open as a pop-up and may block this behavior
 * so we instead inject a link, click it, and remove the link
 * https://stackoverflow.com/questions/20696041/window-openurl-blank-not-working-on-imac-safari
 */
declare const _default: ({ url }: {
    url: string;
}) => void;
export default _default;
