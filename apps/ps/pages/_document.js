import { Html, Head, Main, NextScript } from 'next/document';
const MIXPANEL_ID = 'f8da34e1b2b2788945d3ce0bef77c834';

export default function Document() {
  return (
    <Html>
      <Head />
      <body data-bgcolor="coolrainbow" data-textcolor="light" data-bggradient>
        <Main />
        <NextScript />
        {/* Contact form */}
        <script src="https://apps.elfsight.com/p/platform.js" defer></script>
        {/* Mixpanel */}
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
        {/* OpenReplay Tracking Code for my first project */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          var initOpts = {
            projectKey: "dxpWykwOpdqUIBMLcEB9",
            defaultInputMode: 0,
            obscureTextNumbers: false,
            obscureTextEmails: false,
          };
          var startOpts = { userID: "" };
          (function(A,s,a,y,e,r){
            r=window.OpenReplay=[e,r,y,[s-1, e]];
            s=document.createElement('script');s.src=A;s.async=!a;
            document.getElementsByTagName('head')[0].appendChild(s);
            r.start=function(v){r.push([0])};
            r.stop=function(v){r.push([1])};
            r.setUserID=function(id){r.push([2,id])};
            r.setUserAnonymousID=function(id){r.push([3,id])};
            r.setMetadata=function(k,v){r.push([4,k,v])};
            r.event=function(k,p,i){r.push([5,k,p,i])};
            r.issue=function(k,p){r.push([6,k,p])};
            r.isActive=function(){return false};
            r.getSessionToken=function(){};
          })("//static.openreplay.com/latest/openreplay.js",1,0,initOpts,startOpts);
        `,
          }}
        />
        {/* Experimental CF CAPTCHA 
        client-side code: 0x4AAAAAAABozpPwjOO9kwYb
        back-end code: 0x4AAAAAAABozldcmsxI0Cbc-0Fp7kW8PW0
        documentation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
         */}
        {/* <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
        ></script> */}
      </body>
    </Html>
  );
}
