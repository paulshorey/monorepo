/**
 * If you want to execute a function LATER, but want to set its arguments NOW.
 * Use with Promise.all or something fancy like that. For when you need to
 * set function's arguments immediately, but call the function later.
 * ```
 * let doLater = call_later(console.warn, ['go for a run']);
 * ```
 * @param {function} func - function you want to call later (to curry). It can be bound
 * @param {array} args - array of arguments (this is not useful without arguments)
 */
export default function call_later(func: Function, args: Array<any>): Function;
