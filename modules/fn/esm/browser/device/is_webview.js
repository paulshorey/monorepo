// @ts-nocheck
/**
 * A webpage sometimes opens in Facebook or other app's built-in "webview" browser
 *
 * This function detects if the current page is being opened in a webview
 * @returns boolean
 */
export default function is_webview() {
    if (typeof window !== "object") {
        throw new Error('Must be called from browser. Error: window !== "object"');
    }
    if (/iPhone|iPad|iPod/.test(window.navigator.userAgent)) {
        if (!/Version|Chrome|CriOS|OPT|Firefox|Fxi|Kiwi|Dolphin|Opera/.test(window.navigator.userAgent)) {
            // eslint-disable-next-line no-console
            return true;
        }
    }
    return false;
}
