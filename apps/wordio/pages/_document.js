import Document, { Html, Head, Main, NextScript } from "next/document";

const MIXPANEL_ID = "26c4e58776d95d6b5cd410d29874cba5";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta httpEquiv="x-dns-prefetch-control" content="on" />
          <meta property="og:title" content="Best domain name suggestions" />
          <meta
            property="og:description"
            content="Find the best available domain name. Our AI analyzes 2000 TLDs, and 10000000 synonyms, then generates 100s of available domain names."
          />
          <meta property="og:image" content="/gfx/square/avatar-og.png" />
          {process.env.NEXT_PUBLIC_HOST === "wordio.co" ? (
            <>
              <link rel="apple-touch-icon" sizes="180x180" href="/logo/favicon_w/apple-touch-icon.png" />
              <link rel="icon" type="image/png" sizes="32x32" href="/logo/favicon_w/favicon-32x32.png" />
              <link rel="icon" type="image/png" sizes="16x16" href="/logo/favicon_w/favicon-16x16.png" />
            </>
          ) : (
            <>
              <link rel="apple-touch-icon" sizes="180x180" href="/logo/favicon_d/apple-touch-icon.png" />
              <link rel="icon" type="image/png" sizes="32x32" href="/logo/favicon_d/favicon-32x32.png" />
              <link rel="icon" type="image/png" sizes="16x16" href="/logo/favicon_d/favicon-16x16.png" />
            </>
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
          <div className="sk-cube-grid">
            <div className="sk-cube sk-cube1" />
            <div className="sk-cube sk-cube2" />
            <div className="sk-cube sk-cube3" />
            <div className="sk-cube sk-cube4" />
            <div className="sk-cube sk-cube5" />
            <div className="sk-cube sk-cube6" />
            <div className="sk-cube sk-cube7" />
            <div className="sk-cube sk-cube8" />
            <div className="sk-cube sk-cube9" />
          </div>
          <form id="Domain101Form" style={{ display: "none" }} method="post" action="https://www.101domain.com/affiliate/bestadomains.htm" target="_blank">
            <b className="color-light">Search 101Domain.com: </b>
            <input type="text" name="root" required id="Domain101Input" />
            <input type="hidden" name="action" value="search" />
            <input type="hidden" name="tld" value=".app" />
            <button type="submit">Search</button>
          </form>
          <script src="/scripts/onLoad.js" data-host={process.env.NEXT_PUBLIC_HOST} />

          {/* RECAPTCHA */}
          <script src="https://www.google.com/recaptcha/api.js?render=6LfSN-MUAAAAAOxMUojSlBxkicjSeX1YLW8ds8C1" />

          {/* ELFSIGHT */}
          <div className="elfsight-app-449dc901-7366-43df-b29a-84f77ee0f999"></div>
          <script src="https://apps.elfsight.com/p/platform.js" />

          {/*
           * Mixpanel analytics
           */}
          {!!MIXPANEL_ID && (
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
            for(h=0;h<i.length;h++)g(a,i[h]);var j="set set_once union unset remove delete".split(" ");a.get_group=function(){function b(c){d[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));a.push([e,call2])}}for(var d={},e=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<j.length;c++)b(j[c]);return d};b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?
            MIXPANEL_CUSTOM_LIB_URL:"file:"===f.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);
            mixpanel.init("${MIXPANEL_ID}");`,
              }}
            />
          )}
        </body>
      </Html>
    );
  }
}
