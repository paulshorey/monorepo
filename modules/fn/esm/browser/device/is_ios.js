/**
 * Returns true if page loaded on iPhone or iPod or iPad, including Xcode simulation
 * @returns boolean
 */
const is_ios = function () {
    var _a;
    if (typeof window !== "object") {
        throw new Error("This can only be called in the browser!");
    }
    return (["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(((_a = window.navigator) === null || _a === void 0 ? void 0 : _a.platform) || "") ||
        // iPad on iOS 13 detection
        (window.navigator.userAgent.includes("Mac") && "ontouchend" in window.document));
};
export default is_ios;
