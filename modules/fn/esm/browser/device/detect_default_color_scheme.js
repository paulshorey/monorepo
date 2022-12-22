export default function () {
    let scheme = 'light'; // default to light
    // local storage is used to override OS theme settings
    if (localStorage.getItem('color-scheme')) {
        if (localStorage.getItem('color-scheme') === 'dark') {
            scheme = 'dark';
        }
    }
    else if (!window.matchMedia) {
        // matchMedia method not supported
        return scheme;
    }
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // OS theme setting detected as dark
        scheme = 'dark';
    }
    // dark theme preferred, set document with a `data-theme` attribute
    if (scheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    return scheme;
}
