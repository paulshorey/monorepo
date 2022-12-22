/**
 * Returns true if page loaded on iPhone or iPod, including Xcode simulation
 * @returns boolean
 */
export default function () {
    var _a;
    if (typeof window !== "object") {
        throw new Error("This can only be called in the browser!");
    }
    // detects only iPhone (phone) device, not just any iOS device.
    // includes iPod as well (close enough to iPhone) but not iPad (tablet, not phone!)
    return (["iPhone Simulator", "iPod Simulator", "iPhone", "iPod"].includes(((_a = window.navigator) === null || _a === void 0 ? void 0 : _a.platform) || "") ||
        // iPad on iOS 13 detection
        (window.navigator.userAgent.includes("Mac") && "ontouchend" in window.document));
}
