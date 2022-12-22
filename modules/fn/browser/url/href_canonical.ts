/**
 * Fix for anchor tag href attribute, if it comes from Wordpress or some other content editor
 * @param href - link url
 * @param host - canonical host - if not provided, will use window.location.host
 * @returns - modified href
 */
export default function (href: string, host: string): string {
  if (typeof window === "undefined") return href;
  return href
    .replace("www." + host, "" + host) // ensure consistency, strip then add back in
    .replace(new RegExp("^" + host), "https://" + host)
    .replace(`http//localhost:3000${window.location.pathname}`, "")
    .replace(`http//localhost:3000`, "")
    .replace(`${window.location.protocol}//${window.location.host}${window.location.pathname}`, "")
    .replace(`${window.location.protocol}//${window.location.host}`, "")
    .replace("//" + host, "//www." + host)
    .replace("http://app." + host, "https://app." + host)
    .replace("http://www." + host, "https://www." + host); // for consistency, always use canonical URL
}
