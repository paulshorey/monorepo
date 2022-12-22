// @ts-nocheck
/**
 * Which OS the page is currently loaded on
 * @returns string - MacOS|iOS|Android|Windows|Linux| empty string if not detected
 */
export default function get_os(): "Mac" | "iPhone" | "iPad" | "Android" | "Windows" | "Linux" | "" {
  if (typeof window !== "object") {
    throw new Error("This can only be called in the browser!");
  }
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  if (["Macintosh", "MacIntel", "MacPPC", "Mac68K"].indexOf(platform) !== -1) {
    return "Mac";
  } else if (/Android/.test(userAgent)) {
    return "Android";
  } else if (platform.includes("iPhone") || platform.includes("iPod")) {
    return "iPhone";
  } else if (["Win32", "Win64", "Windows", "WinCE"].indexOf(platform) !== -1) {
    return "Windows";
  } else if (platform.includes("iPad")) {
    return "iPad";
  } else if (/Linux/.test(platform)) {
    return "Linux";
  } else {
    return "";
  }
}
