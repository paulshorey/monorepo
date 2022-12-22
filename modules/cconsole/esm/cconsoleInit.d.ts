type cconsole = {
    updateOptions: (newOptions?: options) => void;
    disable: () => void;
    enable: () => void;
    log: (message: string, ...args: any[]) => void;
    info: (message: string, ...args: any[]) => void;
    debug: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
    trace: (message: string, ...args: any[]) => void;
    success: (message: string, ...args: any[]) => void;
    subtle: (message: string, ...args: any[]) => void;
    clear: () => void;
    time: (label: string) => void;
    table: (tabularData: any, properties?: string[]) => void;
    timeEnd: (label: string) => void;
    timeLog: (label: string, ...data: any[]) => void;
    assert: (condition?: boolean, message?: string, ...data: any[]) => void;
    count: (label?: string) => void;
    countReset: (label?: string) => void;
    dir: (item: any, options?: any) => void;
    dirxml: (value: any) => void;
    group: (label?: string, ...data: any[]) => void;
    groupCollapsed: (label?: string, ...data: any[]) => void;
    groupEnd: () => void;
    profile?: (label?: string) => void;
    profileEnd?: (label?: string) => void;
    timeStamp?: (label?: string) => void;
};
type options = {
    logToCloud?: Record<string, Function>;
    disabled?: boolean;
    useTrace?: boolean;
    useColor?: boolean;
    separateTypes?: boolean;
};
/**
 * Log to console, and optionally to your custom cloud functions
 *    In console, will color code each message:
 *        info: green
 *        warn: orange
 *        error: red
 *    Other methods (log, debug, trace, table, are not colored,
 *    because the coloring breaks Chrome developer tools console message)
 *
 * @param options {object} - options and settings
 *    See github project for more documentation and examples.
 * @param options.logToCloud {object} - an object of {key:value{function},} pairs
 *    Ex: {log:function(){}, info:function(){}, etc}
 *    Tested, and works well with LogDNA. `options.logToCloud = logdna.createLogger()`
 *    See github project for more documentation and examples.
 */
declare const cconsoleInit: (options?: options) => cconsole;
export default cconsoleInit;
