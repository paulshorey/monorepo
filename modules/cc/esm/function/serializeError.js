import destroyCircular from "./destroyCircular";
export default (value) => {
    if (typeof value === "object") {
        return destroyCircular(value, []);
    }
    // People sometimes throw things besides Error objects…
    if (typeof value === "function") {
        // `JSON.stringify()` discards functions. We do too, unless a function is thrown directly.
        return `[Function: ${value.name || "anonymous"}]`;
    }
    return value;
};
