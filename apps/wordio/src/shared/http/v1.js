import parse_error_message from "@techytools/fn/io/err/parse_error_message";
import { message } from "antd";
import axios from "axios";
import cconsole from "@techytools/cc";

/*
 * CONNECT TO HOST
 */
const apiHeaders = function (name) {
  let headers = {
    "content-type": "application/json",
    useQueryString: true,
    "x-rapidapi-user": "wordio",
  };
  return headers;
};
const apiHost = function (name) {
  return process.env.NEXT_PUBLIC_API_HOST;
};

/*
 * ANY GET API
 */
export function v1_get(endpoint, params) {
  return new Promise((resolve, reject) => {
    if (!endpoint || !params || !params.str) {
      reject("!endpoint || !params || !params.str");
    }
    console.log("attempting to get", apiHost(endpoint) + endpoint + "?str=" + encodeURIComponent(params.str));
    axios({
      method: "get",
      url: apiHost(endpoint) + endpoint + "?str=" + encodeURIComponent(params.str),
      headers: apiHeaders(endpoint),
    })
      .then((results) => {
        /*
         * which data
         * expecting server response to have data key
         * but Axios puts its response into data key also
         */
        if (results.data && "data" in results.data) {
          resolve(results.data.data); // correct
        } else {
          console.error('server response did not have "data" key');
          resolve(results.data);
        }
      })
      .catch((err) => {
        message.error(parse_error_message(err), 10);
        reject(err);
      });
  });
}
/*
 * SEDO
 */
export function v1_sedo(params = {}) {
  return new Promise((resolve) => {
    if (params.domain) {
      if (typeof window === "object" && window.isLoading) window.isLoading("data");
      axios({
        method: "get",
        url: apiHost("crawl") + "/v1/crawl?site=sedo&str=" + params.domain,
        headers: apiHeaders("crawl"),
      })
        .then((results) => {
          if (results.data && "data" in results.data) {
            resolve(results.data.data); // correct
          } else {
            console.error("crawl response did not have data");
            resolve({});
          }
        })
        .catch((err) => {
          // message.error(parse_error_message(err), 10);
        })
        .then(() => {
          if (typeof window === "object" && window.doneLoading) window.doneLoading("data");
        });
    } else {
      resolve();
    }
  });
}

/*
 * AFTERNIC
 */
export function v1_afternic(params = {}) {
  return new Promise((resolve) => {
    if (params.domain) {
      if (typeof window === "object" && window.isLoading) window.isLoading("data");
      axios({
        method: "get",
        url: apiHost("crawl") + "/v1/crawl?site=afternic&str=" + params.domain,
        headers: apiHeaders("crawl"),
      })
        .then((results) => {
          if (results.data && "data" in results.data) {
            resolve(results.data.data); // correct
          } else {
            console.error("crawl response did not have data");
            resolve({});
          }
        })
        .catch((err) => {
          // message.error(parse_error_message(err), 10);
        })
        .then(() => {
          if (typeof window === "object" && window.doneLoading) window.doneLoading("data");
        });
    } else {
      resolve();
    }
  });
}

/*
 * WHOIS
 */
export function v1_whois(params = {}) {
  return new Promise((resolve) => {
    if (params.domain) {
      if (typeof window === "object" && window.isLoading) window.isLoading("data");
      axios({
        method: "get",
        url: apiHost("domain-search-tools") + "/v1/domain/whois?domain=" + params.domain + "&recaptcha3_token=" + window?.recaptcha3_token,
        headers: apiHeaders("domain-search-tools"),
      })
        .then((results) => {
          if (results.data && "data" in results.data) {
            resolve(results.data.data); // correct
          } else {
            console.error("whois response did not have data");
            resolve({});
          }
        })
        .catch((err) => {
          // message.error(parse_error_message(err), 10);
        })
        .then(() => {
          if (typeof window === "object" && window.doneLoading) window.doneLoading("data");
        });
    } else {
      resolve();
    }
  });
}

/*
 * API METHOD: AVAILABILITY
 */
export function v1_domain_availability(params = {}) {
  return new Promise((resolve) => {
    // console.warn("received                        v1_domain_availability")
    // console.timeEnd("/ds")
    if (params.domains && params.domains.length) {
      axios({
        method: "post",
        url: apiHost("domain-availability") + "/v1/domain/availability",
        data: params,
        headers: apiHeaders("domain-availability"),
      })
        .then((results) => {
          if (results.data && "data" in results.data) {
            resolve(results.data.data); // correct
          } else {
            console.error("availability response did not have data");
            resolve({});
          }
        })
        .catch((err) => {
          message.error(parse_error_message(err), 10);
        })
        .then(() => {
          /*
           * done loading
           */
          if (typeof window === "object" && window.doneLoading) window.doneLoading("data");
        });
    } else {
      resolve();
    }
  });
}

/*
 * API METHOD: SUGGESTIONS
 */
export function v1_domain_suggestions(params = {}) {
  if (!params || !params.str) {
    return;
  }
  return new Promise((resolve) => {
    /*
     * start loading
     */
    if (typeof window === "object" && window.isLoading) window.isLoading("data");
    let postParams = {
      str: params.str,
      tld: params.tlds_use && params.tlds_use[0] ? params.tlds_use[0] : "com",
      site_id: params.site_id,
    };
    let timeStart = Date.now();
    axios({
      method: "post",
      url: apiHost("domain-suggestions") + "/v1/domain/suggestions",
      params: postParams,
      data: { ...params },
      headers: apiHeaders("domain-suggestions"),
    })
      .then((results) => {
        let data = {};
        if (results.data && "data" && "data" in results.data) {
          data = results.data.data;
        }
        /*
         * track success
         */
        let req_str = postParams.str + "." + postParams.tld;
        let res_time = ((Date.now() - timeStart) / 1000).toFixed(2) * 100;
        let res_suggestions = {};
        let res_total = 0;
        if (data.domains) {
          for (let type in data.domains) {
            res_suggestions[type] = data.domains[type] ? data.domains[type].length : 0;
            res_total += res_suggestions[type];
          }
        }
        if (typeof window === "object" && window.ga) {
          window.ga("send", {
            hitType: "event",
            eventCategory: "suggestions success",
            eventAction: req_str,
            eventValue: res_time,
            eventLabel: `"${req_str}" @${res_time} ${JSON.stringify(res_suggestions)}`,
            user_id: data ? data.user_id : "",
          });
        }
        /*
         * output data
         */
        resolve(data);
      })
      .catch((err) => {
        message.error(parse_error_message(err), 10);
        /*
         * track error
         */
        let req_str = postParams.str + "." + postParams.tld;
        let res_time = ((Date.now() - timeStart) / 1000).toFixed(2) * 100;
        if (typeof window === "object" && window.ga) {
          window.ga("send", {
            hitType: "event",
            eventCategory: "suggestions error",
            eventAction: req_str,
            eventValue: res_time,
            eventLabel: `"${req_str}" @${res_time} ${err.toString()}`,
          });
        }
      })
      .then(() => {
        /*
         * done loading
         */
        if (typeof window === "object" && window.doneLoading) window.doneLoading("data");
      });
  });
}
