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
export default function (queryParamsFromCode?: InputParams): OutputParams;
export {};
