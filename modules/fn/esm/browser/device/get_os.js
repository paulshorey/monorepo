/**
 * Which OS the page is currently loaded on
 * @returns string - MacOS|iOS|Android|Windows|Linux| empty string if not detected
 */
export default function get_os() {
    if (typeof window !== "object") {
        throw new Error("This can only be called in the browser!");
    }
    const userAgent = window.navigator.userAgent;
    const platform = window.navigator.platform;
    if (["Macintosh", "MacIntel", "MacPPC", "Mac68K"].indexOf(platform) !== -1) {
        return "MacOS";
    }
    else if (["iPhone", "iPad", "iPod"].indexOf(platform) !== -1) {
        return "iOS";
    }
    else if (["Win32", "Win64", "Windows", "WinCE"].indexOf(platform) !== -1) {
        return "Windows";
    }
    else if (/Android/.test(userAgent)) {
        return "Android";
    }
    else if (/Linux/.test(platform)) {
        return "Linux";
    }
    else {
        return "";
    }
}
