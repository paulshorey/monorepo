/**
 * Track page view (when a new route is written to browser history)
 */
export declare const analytics_track_page: (options: {
    name: string;
    path: string;
    postSlug?: string;
    categorySlug?: string;
    experiments?: any;
} & Record<string, any>) => void;
/**
 * Track the "Sign up" or "Download our app" button click
 * @param {object} options
 * @param {string} opt.from - where in the site the button was clicked
 */
export declare const analytics_track_cta: (options: {
    from?: string;
}) => void;
/**
 * Track all link clicks
 * Navigating to a page ("/" internal), or external ("https://..."), and even hash links ("#...")
 */
export declare const analytics_track_link: (options: {
    from?: string;
    href: string;
    type?: string;
    fromPageName?: string;
    fromPagePath?: string;
    fromSection?: string;
}) => void;
