import { RX__search_now } from "src/shared/redux/actions/io";
import { get as http_get, put as http_put } from "@techytools/fn/requests/fetcher";

import { message } from "antd";

const NEXT_PUBLIC_DEV_ADMIN_API_HOST = "//" + process.env.NEXT_PUBLIC_DEV_ADMIN_API_HOST;

export function data_domains_all(key) {
  if (typeof window === "object" && window.isLoading) window.isLoading("domains");
  return async (dispatch) => {
    // get word
    let row = await http_get(NEXT_PUBLIC_DEV_ADMIN_API_HOST + "/data/domains");
    if (row) {
      // success
      if (typeof window === "object" && window.doneLoading) window.doneLoading("domains");
      return row;
    }
    // fail
    if (typeof window === "object" && window.isLoading) window.doneLoading("domains");
    return false;
  };
}

export function data_domain_syns_dict(key) {
  if (typeof window === "object" && window.isLoading) window.isLoading("domain");
  return async (dispatch) => {
    // get word
    let data = await http_get(NEXT_PUBLIC_DEV_ADMIN_API_HOST + "/data/domain_syns_of_syns/" + key);
    if (data) {
      // success
      setTimeout(() => {
        if (typeof window === "object" && window.doneLoading) window.doneLoading("domain");
      }, 500);
      return data;
    }
    // fail
    if (typeof window === "object" && window.doneLoading) window.doneLoading("domain");
    return false;
  };
}

export function data_domain_get(key) {
  if (typeof window === "object" && window.isLoading) window.isLoading("data_domain_get");
  return async (dispatch) => {
    // get word
    let row = await http_get(NEXT_PUBLIC_DEV_ADMIN_API_HOST + "/data/domain/" + key);
    if (row) {
      // success
      if (typeof window === "object" && window.doneLoading) window.doneLoading("data_domain_get");
      return row;
    }
    // fail
    if (typeof window === "object" && window.doneLoading) window.doneLoading("data_domain_get");
    return false;
  };
}

export function data_domain_edit(row) {
  if (typeof window === "object" && window.isLoading) window.isLoading("data_domain_edit");
  // validate
  if (!Array.isArray(row.syns)) {
    row.syns = (row.syns || "")
      .split(",")
      .map((w) => w.trim())
      .filter((w) => !!w);
  }
  if (!Array.isArray(row.syns1)) {
    row.syns1 = (row.syns1 || "")
      .split(",")
      .map((w) => w.trim())
      .filter((w) => !!w);
  }
  return async (dispatch, getState) => {
    // save
    let res = await http_put(NEXT_PUBLIC_DEV_ADMIN_API_HOST + "/data/domain/" + row.key, row);
    if (res) {
      // ui alert
      message.success(`edited domain "${row.key}"`);
      // update data
      dispatch(RX__search_now());
      if (typeof window === "object" && window.doneLoading) window.doneLoading("data_domain_edit");
      return res;
    }
    if (typeof window === "object" && window.doneLoading) window.doneLoading("data_domain_edit");
    return false;
  };
}
