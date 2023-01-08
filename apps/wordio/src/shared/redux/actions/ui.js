/*
 * Open contact form
 */
export function open_contact_form(key, force = null) {
  try {
    window.document.querySelector(".eapps-form-floating-button").click();
  } catch (e) {
    window.alert("Please contact: paul@besta.domains   +1.385.770.6789");
  }
}

/*
 * Toggle view options
 */
export function RX__toggle_key(key, force = null) {
  return {
    type: "RX__toggle_key",
    key: key,
    force: force
  };
}

/*
 * Etc
 */
export function RX__focusSelectTld() {
  return {
    type: "RX__focusSelectTld"
  };
}

export function RX__meta_title({ str = "", tld = "" }) {
  // console.log("RX__meta_title", { str, tld })
  return (dispatch, getState) => {
    let { input } = getState();

    /*
     * str
     */
    if (!str && input.str) {
      str = input.str;
    }

    /*
     * title
     */
    let title = str.replace(/ /g, " ") + (tld ? " ." + tld : "");

    /*
     * home
     */
    if (!str && !tld) {
      return;
    }

    /*
     * url
     */
    // let url_obj = { str, tld };
    // let search = querystring_from_object(url_obj);
    // let href = search;
    // if (typeof window === "object") {
    //   href = window.location.pathname + search + window.location.hash;
    //   if (search && href !== window.location.href) {
    //     useRouter().push(href);
    //   }
    // }

    /*
     * save
     */
    dispatch({
      type: "RX__meta_title",
      data: title
    });
  };
}

export function RX__search_title(title) {
  return {
    type: "RX__search_title",
    data: title
  };
}

export function RX__toast(intent, message) {
  // IF BOTH ARGUMENTS PROVIDED:
  if (intent && message) {
    // remap intent
    switch (intent) {
      case "error":
        intent = "danger";
        break;
      case "fail":
        intent = "warning";
        break;
      default:
        intent = "success";
        break;
    }
    // display second argument
    return {
      type: "RX__toast",
      intent: intent,
      message: message
    };
  }
  // OPTIONALLY, USE WITH ONLY ONE ARGUMENT:
  if (intent && !message) {
    // display first argument instead of second
    return {
      type: "RX__toast",
      intent: "",
      message: intent
    };
  }
}
