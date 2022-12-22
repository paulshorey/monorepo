const obj_destroy_circular = (from, seen = []) => {
    // null seen as object
    if (from === null || from === undefined) {
        return from;
    }
    // setup output variable
    const to = Array.isArray(from) ? [] : {};
    // reading
    seen.push(from);
    // iterate input
    for (const [key, value] of Object.entries(from)) {
        if (typeof value === "function") {
            continue;
        }
        if (!value || typeof value !== "object") {
            to[key] = value;
            continue;
        }
        if (!seen.includes(from[key])) {
            to[key] = obj_destroy_circular(from[key], seen.slice());
            continue;
        }
        to[key] = "[Circular]";
    }
    const commonProperties = ["name", "message", "stack", "code"];
    for (const property of commonProperties) {
        if (typeof from[property] === "string") {
            to[property] = from[property];
        }
    }
    return to;
};
export default obj_destroy_circular;
