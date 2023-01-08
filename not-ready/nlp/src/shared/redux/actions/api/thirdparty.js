import { get as http_get } from "@techytools/fn/requests/fetcher";

const NEXT_PUBLIC_DEV_ADMIN_API_HOST = "//" + process.env.NEXT_PUBLIC_DEV_ADMIN_API_HOST;

/*
 * THIRDPARTY
 */
export function definitions_list_get(key) {
  return async () => {
    // get word
    let row = await http_get(NEXT_PUBLIC_DEV_ADMIN_API_HOST + "/v1/word/definitions/" + key);
    if (row) {
      // success
      return row;
    }
    // fail
    return false;
  };
}
