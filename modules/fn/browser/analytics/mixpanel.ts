// @ts-nocheck
// import get_attribution_params from "../url/get_attribution_params";

const DEBUG1 = true; // warn - when actually sending request to analytics company
const DEBUG2 = false; // log - for helper functions, not sending anything yet

/**
 * Used for tracking random stuff not covered by above functions
 * (like a status of a user's interaction in PartnerForm)
 * @param {string} label - name of the event
 * @param {object} options - options properties
 */
export const mixpanel_track = function ({ label, options }) {
  if (typeof window !== "object" || !window?.mixpanel?.track) return;
  mixpanel_add_to_queue({ label, options });
};

/*
 *
 * PRIVATE LIBRARY FOR MIXPANEL ONLY:
 *
 */
const mixpanel_track_event_now = function ({ label, options }) {
  if (!label || !options) return;
  if (DEBUG1) console.warn('mixpanel track "' + label + '"', options);
  window?.mixpanel?.track(label, options);
};

const mixpanel_track_all_from_queue = function () {
  if (window.analytics_queue.length) {
    if (DEBUG2) console.log("mixpanel_track_all_from_queue");
    for (let event of window.analytics_queue) {
      mixpanel_track_event_now(event);
    }
  }
};

const mixpanel_track_one_from_queue = function () {
  if (window.analytics_queue.length) {
    if (DEBUG2) console.log("mixpanel_track_one_from_queue");
    mixpanel_track_event_now(window.analytics_queue.shift());
  }
};

const mixpanel_add_to_queue = function ({ label, options = {} }) {
  if (typeof window !== "object" || !window.mixpanel) {
    if (typeof window === "object") console.warn("!window.mixpanel");
  }
  if (DEBUG2) console.log("mixpanel_add_to_queue");
  // init
  if (!window.analytics_queue || !window.analytics_interval) {
    window.analytics_queue = [];
    window.analytics_interval = setInterval(mixpanel_track_one_from_queue, 1000);
    // beforeunload unfortunately does not work ever on most browsers. On some it might fire occasionally?
    window.document.addEventListener("beforeunload", function () {
      // track the browser close event
      mixpanel_track_all_from_queue();
      mixpanel_track_event_now({
        label: "exit",
        options: { untracked_events: window.analytics_queue.length }
      });
    });
  }
  // cleanup options
  for (let key in options) {
    if (options[key] === null || options[key] === undefined) {
      delete options[key];
    }
  }
  // track
  if (window.analytics_queue.length === 0) {
    // no need to wait for previous event, because it happened over 1 sec ago
    mixpanel_track_event_now({ label, options });
    analytics_queue.push({});
  } else {
    // if events are being created faster than one second, slow down to max 1 sec per event
    analytics_queue.push({ label, options });
  }
};
