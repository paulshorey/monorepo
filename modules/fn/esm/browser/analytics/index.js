import { mixpanel_track } from "./mixpanel";
const DEBUG1 = false; // log
/**
 * Track page view (when a new route is written to browser history)
 */
export const analytics_track_page = function (options) {
    // remove trailing slash
    options.path = options.path.replace(/[\/]+$/, "");
    // keep lash if root
    if (options.path === "")
        options.path = "/";
    // label
    let label = "PageView";
    mixpanel_track({ label, options });
    // Google Analytics
    // GA4 may track SPA route changes automatically? See:
    // https://www.analyticsmania.com/post/single-page-web-app-with-google-tag-manager/
    if (typeof window !== "object")
        return;
    if (DEBUG1) {
        console.warn("gtag track pageview", {
            page_title: options.name,
            page_path: options.path
        });
    }
    // if (!window.gtag) {
    //   console.error("!window.gtag");
    //   return;
    // }
    // window.gtag("config", process.env.NEXT_PUBLIC_GTAG_ID, {
    //   page_path: options.path,
    //   page_title: options.name
    // });
    // Facebook
    // Facebook automatically tracks changes to push state?
};
/**
 * Track the "Sign up" or "Download our app" button click
 * @param {object} options
 * @param {string} opt.from - where in the site the button was clicked
 */
export const analytics_track_cta = function (options) {
    let label = "CTA";
    mixpanel_track({ label, options });
    // track Facebook
    // if (typeof window === "object" && window.fbq) {
    //   console.log("tracking Facebook Lead click");
    //   window.fbq("track", "Lead");
    // }
    // track in TikTok
    // if (typeof window === "object" && window.ttq) {
    //   window.ttq.track("ClickButton");
    // }
};
/**
 * Track all link clicks
 * Navigating to a page ("/" internal), or external ("https://..."), and even hash links ("#...")
 */
export const analytics_track_link = function (options) {
    let label = "link click";
    // format href
    options.type = href_type(options.href);
    // opt.href = href_canonical(opt.href); // use canonical url format
    // is CTA
    if (options.href.includes("/sign-up")) {
        if (!options.from) {
            options.from = "link";
        }
        analytics_track_cta(options);
        return;
    }
    // is contact, track in TikTok
    if (options.href.includes("mailto:") || options.href.includes("tel:")) {
        // if (typeof window === "object" && window.ttq) {
        //   window.ttq.track("Contact");
        // }
    }
    // track in Mixpanel
    mixpanel_track({ label, options });
};
/*
 * PRIVATE HELPERS
 */
const href_type = function (href) {
    if (href.substring(0, 1) === "#") {
        return "hashtag";
    }
    else if (href.substring(0, 4) === "http" &&
        !href.includes(window.location.hostname) &&
        !href.includes("localhost:")) {
        // how to know host name in lib ?
        return "external";
    }
    else if (href.substring(0, 7) === "mailto:" || href.substring(0, 4) === "tel:") {
        return "contact";
    }
    else {
        return "internal";
    }
};
