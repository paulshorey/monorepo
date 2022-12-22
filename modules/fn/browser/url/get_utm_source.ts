/**
 * Gets value for ?utm_source= query param, from referer if possible, or make one up from referer domain.
 * @returns - utm_source value
 */
export default function get_utm_source(): string {
  let out = "direct";
  let referer = decodeURIComponent(window.document.referrer);
  if (referer) {
    if (referer.includes("utm_source=")) {
      /* 
      If referer already contains a utm_source, like this facebook ad, then just use that.
      https://l.facebook.com/l.php?u=https://www.plaidsettlement.com/?utm_source=facebook&utm_medium=cpm&utm_campaign=plaid&utm_term=traffic&utm_content=ad_new1&fbclid=IwAR2R_FIM_IPWkNVMRLVv67Hv0Owh4VQ1mKhnw3KGrMS_DvJApFW_0Vbvt50
       */
      out = referer.split("utm_source=")?.[1]?.split(/[^\w]+/)?.[0] || ""; // get just the "facebook" part from ...?utm_source=facebook&...
    }
    if (out === "direct") {
      /*
      Guess source from referer domain name
       */
      let host = referer?.split("/")?.[2] || "";
      if (host) {
        if (host.substring(0, 9) === "localhost" || host.substr(-9) === "wordio.co") {
          // fixMe - wordio.co needs to be generalized to server host or site theme.host
          out = "direct";
        } else {
          out = host;
        }
        if (host === "t.co" || host.substring(0, 5) === ".t.co" || host.substr(-11) === "twitter.com") {
          out = "twitter";
        }
        if (host === "f.co" || host.substring(0, 5) === ".f.co" || host.substr(-12) === "facebook.com") {
          out = "facebook";
        }
        if (host.substr(-10) === "tiktok.com") {
          out = "tiktok";
        }
        if (host.substr(-12) === "linkedin.com") {
          out = "linkedin";
        }
        if (host.substr(-13) === "instagram.com") {
          out = "instagram";
        }
        if (host.substr(-10) === "google.com") {
          out = "google";
        }
        if (host.substr(-11) === "youtube.com") {
          out = "youtube";
        }
      }
    }
  }
  return out;
}
