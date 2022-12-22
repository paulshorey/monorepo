import CConsoleLog from "./function/CConsoleLog";
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
const cconsoleInit = function (options = {}) {
    // so different actions (log/info/debug/etc) can communicate with eachother:
    let sharedContext = {};
    // log
    let cconsole = {
        updateOptions: function (newOptions = {}) {
            for (let key in newOptions) {
                options[key] = newOptions[key];
            }
        },
        disable: function () {
            options.disabled = true;
        },
        enable: function () {
            options.disabled = false;
        },
        // custom (colorful) loggers
        log: CConsoleLog.bind({ action: "log", options, sharedContext }),
        info: CConsoleLog.bind({ action: "info", options, sharedContext }),
        debug: CConsoleLog.bind({ action: "debug", options, sharedContext }),
        warn: CConsoleLog.bind({ action: "warn", options, sharedContext }),
        error: CConsoleLog.bind({ action: "error", options, sharedContext }),
        trace: CConsoleLog.bind({ action: "trace", options, sharedContext }),
        success: CConsoleLog.bind({ action: "success", options, sharedContext }),
        subtle: CConsoleLog.bind({ action: "subtle", options, sharedContext }),
        // pass-through system debugging loggers
        clear: console.clear,
        time: console.time,
        table: console.table,
        timeEnd: console.timeEnd,
        timeLog: console.timeLog,
        assert: console.assert,
        count: console.count,
        countReset: console.countReset,
        dir: console.dir,
        dirxml: console.dirxml,
        group: console.group,
        groupCollapsed: console.groupCollapsed,
        groupEnd: console.groupEnd
    };
    // extra pass-through (default) loggers (non-standard)
    if (console.profile) {
        cconsole.profile = console.profile;
    }
    if (console.profileEnd) {
        cconsole.profileEnd = console.profileEnd;
    }
    if (console.timeStamp) {
        cconsole.timeStamp = console.timeStamp;
    }
    // return console
    return cconsole;
};
/*
 * To init with custom options
 */
export default cconsoleInit;
