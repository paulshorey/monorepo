import destroyCircular from "./destroyCircular";
import parseErrorMessage from "./parseErrorMessage";

// use different syntax if in front-end (dev tools) or NodeJS (console)
let BROWSER = typeof window === "object";
let DEFAULT_USE_COLOR = true;
// don't use colors if in NodeJS with "--inspect" or "--inspect-brk" flag
if (!BROWSER && process?.execArgv?.join().includes("--inspect")) {
  DEFAULT_USE_COLOR = false;
}

type boundContext = {
  sharedContext: {
    last_action?: string;
  };
  action: string;
  options: {
    disabled?: boolean;
    logToCloud?: {
      log?: (str: string) => void;
      info?: (str: string) => void;
      warn?: (str: string) => void;
      error?: (str: string) => void;
    };
    useTrace?: boolean;
    useColor?: boolean;
    separateTypes?: boolean;
  };
};

/**
 * Console logging with added features
 */
export default function (this: boundContext): void {
  // optionally, pass log-To-Cloud functions to handle each log action (log,info,error,etc.)
  if (!this.options) this.options = {};
  let { disabled, logToCloud, useTrace = false, useColor = DEFAULT_USE_COLOR, separateTypes = false } = this.options;
  if (disabled) {
    return;
  }

  /*
   * option:
   * trace file:line, where log originated
   */
  let trace = "";
  if (useTrace) {
    let stack: string[] = [];
    let err = new Error();
    if (err.stack) {
      stack = err.stack.split("\n");
      if (stack[2]) {
        // determine file:line which called this console log
        let str = stack[2];
        let i_end = str.lastIndexOf(":");
        let i_start_before = str.lastIndexOf("/", i_end - 20) + 1;
        trace = `(${str.substring(i_start_before, i_end)})`;
      }
    }
  }

  /*
   * fix edge cases
   */
  let args: any = [];
  let a = 0;
  while (a < arguments.length) {
    if (typeof arguments[a] === "object") {
      if (arguments[a] instanceof Error) {
        args[a] = parseErrorMessage(arguments[a]);
      } else {
        args[a] = destroyCircular(arguments[a], []);
      }
    } else {
      args[a] = arguments[a];
    }
    a++;
  }

  /*
   * different color for each action
   *
   * on NODE JS
   * https://en.wikipedia.org/wiki/ANSI_escape_code#Colors <- use "FG Code" for text, "BG Code" for background
   *
   * \x1b[41m     \x1b[33m       %s        \x1b[0m
   * red bg       yellow text    string    escape for next line
   *
   * \x1b[47m           \x1b[30m       %s        \x1b[0m
   * light grey bg      black text     string    escape for next line
   */
  let action = this.action;
  let addColor = "";
  if (useColor && typeof args[0] === "string") {
    /*
     * use by NODEJS in terminal
     */
    if (!BROWSER) {
      switch (this.action) {
        case "error":
          addColor = "\x1b[41m\x1b[33m%s\x1b[0m";
          break;
        case "warn":
          addColor = "\x1b[43m\x1b[30m%s\x1b[0m";
          break;
        case "info":
          addColor = "\x1b[46m\x1b[30m%s\x1b[0m";
          break;
        case "log":
          addColor = "\x1b[47m\x1b[30m%s\x1b[0m";
          break;
        case "debug":
          addColor = "\x1b[45m\x1b[30m%s\x1b[0m";
          break;
        case "trace":
          addColor = "\x1b[106m\x1b[30m%s\x1b[0m";
          break;
        case "success":
          addColor = "\x1b[42m\x1b[30m%s\x1b[0m";
          break;
        case "subtle":
          addColor = "\x1b[40m\x1b[90m%s\x1b[0m";
          break;
      }
    } else {
      /*
       * for use in BROWSER
       */
      switch (action) {
        case "error":
          addColor = "background:red; color:yellow";
          break;
        case "warn":
          addColor = "background:yellow; color:black";
          break;
        case "log":
          addColor = "background:lightgray; color:black";
          break;
        case "info":
          addColor = "background:teal; color:black";
          break;
        case "debug":
          addColor = "background:magenta; color:black";
          break;
        case "trace":
          addColor = "background:cyan; color:black";
          break;
        case "success":
          addColor = "background:lawngreen; color:black";
          break;
        case "subtle":
          addColor = "color:grey";
          break;
      }
    }
  }

  /*
   * Fix actions
   */
  switch (action) {
    case "success":
      action = "log";
      break;
    case "subtle":
      action = "log";
      break;
  }

  /*
   * Add space between different types (groups) of messages
   *    TODO: maybe upgrade this to use console.group in browser
   */
  if (separateTypes) {
    if (action + this.action !== this.sharedContext.last_action) {
      console.log("");
    }
  }

  /*
   * Log message to console
   * - Use colors
   * - Use specified action (log, info, debug, warn, etc)
   * - Add trace (file-name:line-number)
   */
  let firstArg = "";
  if (useColor) {
    firstArg = args.shift();
    if (!BROWSER) {
      // NODE JS process logs in terminal
      if (trace) {
        console[action](addColor, firstArg, ...args.map((arg) => JSON.stringify(arg, null, 2)), trace);
      } else {
        console[action](addColor, firstArg, ...args.map((arg) => JSON.stringify(arg, null, 2)));
      }
    } else {
      // FRONT-END BROWSER logs in DevTools
      if (trace) {
        console[action]("%c" + firstArg, addColor, ...args, trace);
      } else {
        console[action]("%c" + firstArg, addColor, ...args);
      }
    }
  } else {
    if (!BROWSER) {
      // NODE JS process logs in terminal
      if (trace) {
        console[action](JSON.stringify(args, null, 2), trace);
      } else {
        console[action](JSON.stringify(args, null, 2));
      }
    } else {
      if (trace) {
        console[action](...args, trace);
      } else {
        console[action](...args);
      }
    }
  }

  /*
   * Log messages to cloud
   */
  if (logToCloud && logToCloud[action]) {
    logToCloud[action]((firstArg ? JSON.stringify(firstArg) : "") + " " + JSON.stringify(args), trace);
  }

  /*
   * Add linebreak when different actions back to back
   * but no linebreak when same action
   */
  this.sharedContext.last_action = action + this.action;
}
