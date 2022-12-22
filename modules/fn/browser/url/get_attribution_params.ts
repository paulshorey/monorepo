import get_os from "../device/get_os";
import get_utm_source from "./get_utm_source";

type InputParams = {
  referralCode?: string;
  pid?: string;
  c?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  utm_os?: string;
  utm_device?: string;
  utm_browser?: string;
  utm_referrer?: string;
  utm_url?: string;
  utm_path?: string;
  utm_query?: string;
  utm_hash?: string;
  utm_host?: string;
  utm_hostname?: string;
  utm_port?: string;
  utm_protocol?: string;
  utm_search?: string;
  utm_origin?: string;
  utm_href?: string;
  [key: string]: string | number | undefined;
};
type OutputParams = {
  referralCode?: string;
  source?: string;
  ein?: string;
  pid?: string;
  c?: string;
};

/**
 * Get the current marketing attribution variables like pid, c, referralCode, etc.
 * Remember the previous variables in localStorage, refer to them next time this is called.
 * Read about utm attribution parameters: https://www.searchenginejournal.com/utm-codes/370088/
 *
 * @param queryParamsFromCode - set URL/localStorage query params to these keys/values
 *    instead of using new ones from URL/localStorage, use these params from NextJS /page data
 * @returns - { pid, c, referralCode, ein, source } - marketing attribution variables
 */
export default function (queryParamsFromCode: InputParams = {}): OutputParams {
  if (typeof window === "undefined") return {};
  let out = {};

  // INPUT
  // from page
  let qs: InputParams = { ...queryParamsFromCode };
  // from url
  if (typeof URLSearchParams !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    if (!qs.referralCode) qs.referralCode = urlParams.get("referralCode") || "";
    if (!qs.pid) qs.pid = (urlParams.get("pid") || "")?.toLowerCase();
    if (!qs.c) qs.c = (urlParams.get("c") || "")?.toLowerCase();
  }
  // from localstorage
  if (!qs.pid && !qs.ein && !qs.referralCode) {
    let cached = JSON.parse(window.localStorage.getItem("attributionParams") || "{}");
    // attribution params are cached for 24 hours. If expired, simply ignore the cache (localStorage).
    if (cached.expires && new Date().getTime() < cached.expires) {
      delete cached.expires;
      for (let key in cached) {
        if (!qs[key]) qs[key] = cached[key];
      }
    }
  }

  // OUTPUT - MUTUALLY EXCLUSIVE GROUPS OF PARAMETERS
  // partner
  if (qs.ein) {
    out = {
      source: "partner",
      ein: qs.ein
    };
  }
  // referral
  else if (qs.referralCode) {
    out = {
      pid: "referral",
      referralCode: qs.referralCode,
      c: `${get_utm_source().toLowerCase()}_${get_os().toLowerCase()}`
    };
  }
  // advertisement
  else if (qs.pid) {
    out = {
      pid: qs.pid,
      c: qs.c
    };
  }
  // organic
  else {
    out = {
      pid: "web_organic"
    };
  }
  // remember previous attribution params in localStorage
  let cache: any = { ...out }; // tsFix
  cache.expires = new Date().getTime() + 1000 * 60 * 60 * 24; // 24 hours
  window.localStorage.setItem("attributionParams", JSON.stringify(cache));
  // return
  return out;
}
