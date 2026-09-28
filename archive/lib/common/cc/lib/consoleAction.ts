const sharedContext = {
  last_action: "",
};

export const consoleAction = function (action: "log" | "info" | "warn" | "error", message: string, data: any) {
  const BROWSER = typeof window !== "undefined";
  const useColor = true;
  const separateTypes = true;
  const trace = false;
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
  let addColor = "";
  if (useColor) {
    /*
     * use by NODEJS in terminal
     */
    if (!BROWSER) {
      switch (action) {
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
        // case "debug":
        //   addColor = "\x1b[45m\x1b[30m%s\x1b[0m";
        //   break;
        // case "trace":
        //   addColor = "\x1b[106m\x1b[30m%s\x1b[0m";
        //   break;
        // case "success":
        //   addColor = "\x1b[42m\x1b[30m%s\x1b[0m";
        //   break;
        // case "subtle":
        //   addColor = "\x1b[40m\x1b[90m%s\x1b[0m";
        //   break;
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
        // case "debug":
        //   addColor = "background:magenta; color:black";
        //   break;
        // case "trace":
        //   addColor = "background:cyan; color:black";
        //   break;
        // case "success":
        //   addColor = "background:lawngreen; color:black";
        //   break;
        // case "subtle":
        //   addColor = "color:grey";
        //   break;
      }
    }
  }

  /*
   * Fix actions
   */
  // switch (action) {
  //   case "success":
  //     action = "log";
  //     break;
  //   case "subtle":
  //     action = "log";
  //     break;
  // }

  /*
   * Add space between different types (groups) of messages
   *    TODO: maybe upgrade this to use console.group in browser
   */
  if (separateTypes) {
    if (action + action !== sharedContext.last_action) {
      console.log("");
    }
  }

  /*
   * Log message to console
   * - Use colors
   * - Use specified action (log, info, debug, warn, etc)
   * - Add trace (file-name:line-number)
   */
  if (useColor) {
    if (!BROWSER) {
      // NODE JS process logs in terminal
      if (trace) {
        console[action](addColor, message, data, trace);
      } else {
        console[action](addColor, message, data);
      }
    } else {
      // FRONT-END BROWSER logs in DevTools
      console[action](`%c${message}`, addColor, data, trace);
    }
  } else if (!BROWSER) {
    // NODE JS process logs in terminal
    if (trace) {
      console[action](message, data, trace);
    } else {
      console[action](message, data);
    }
  } else if (trace) {
    console[action](message, data, trace);
  } else {
    console[action](message, data);
  }
};
