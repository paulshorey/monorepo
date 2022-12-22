/**
 * Fix for anchor tag href attribute, if it comes from Wordpress or some other content editor
 * @param href - link url
 * @param host - canonical host - if not provided, will use window.location.host
 * @returns - modified href
 */
export default function (href: string, host: string): string;
