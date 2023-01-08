/*
 * HOST name
 */
let HOST = document.currentScript.getAttribute("data-host");
console.log("script host", HOST);

/*
 * Affiliate links
 */
window.open101Domain = function (phraseStringNoSpaces) {
  let form = window.document.getElementById("Domain101Form");
  let input = window.document.getElementById("Domain101Input");
  if (form && input) {
    input.value = phraseStringNoSpaces;
    form.submit();
  }
};

/*
 * Loading Animation - call window.isLoading() to show, then window.doneLoading() to hide
 */
window.doneLoading = function (what) {
  // remove loading animation
  window.document.body.classList.remove("loading_" + what);
};
window.isLoading = function (what, max = 3000) {
  // add loading animation
  window.document.body.classList.add("loading_" + what);
  // auto remove if forgot or errorred
  setTimeout(() => {
    window.document.body.classList.remove("loading_" + what);
  }, max);
};

/*
 * Pause Execution - because Chrome's "pause javascript execution" shortcut is not working!
 */
window.document.body.addEventListener(
  "keyup",
  function (event) {
    if (event.key === "F8") {
      debugger;
    }
  },
  false
);

/*
 * Captcha v3 (initial page load)
 */
if (typeof grecaptcha !== "undefined") {
  grecaptcha.ready(function () {
    grecaptcha.execute("6LfSN-MUAAAAAOxMUojSlBxkicjSeX1YLW8ds8C1", { action: "pageLoad" }).then(function (token) {
      console.warn("EXECUTED CAPTCHA V3 TOKEN =", token);
      window.recaptcha3_token = token;
    });
  });
}

/*
 * Google Analytics
 */
(function (i, s, o, g, r, a, m) {
  i["GoogleAnalyticsObject"] = r;
  (i[r] =
    i[r] ||
    function () {
      (i[r].q = i[r].q || []).push(arguments);
    }),
    (i[r].l = 1 * new Date());
  (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m);
})(window, document, "script", "https://www.google-analytics.com/analytics.js", "ga");
ga("create", 'UA-175046769-${PRODUCTION ? "1" : "3"}', "auto");
ga("set", "dimension1", '${PRODUCTION ? "production" : "development"}');
ga("set", "dimension2", "0.0.3");
ga("config", {
  custom_map: { dimension3: "user_id" }
});

/*
 * GTag
 */
// window.dataLayer = window.dataLayer || [];
// function gtag(){dataLayer.push(arguments);}
// gtag('js', new Date());
// gtag('config', 'UA-175046769-1', {
//   'custom_map': {'dimension3': 'user_id'}
// });
// gtag('set', 'dimension1', '${PRODUCTION ? "production" : "development"}');
// gtag('set', 'dimension2', '0.0.2');

/*
 * Talk.io Chat Support
 */
// var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
// (function(){
// var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
// s1.async=true;
// s1.src='https://embed.tawk.to/5f4585c6cc6a6a5947aec934/default';
// s1.charset='UTF-8';
// s1.setAttribute('crossorigin','*');
// s0.parentNode.insertBefore(s1,s0);
// })();

/*
 * Elfsight
 */
setTimeout(function () {
  // let elfsightlink = document.querySelector('.eapps-link');
  let elftext = document.querySelector(".eapps-form-header-text");
  if (elftext) {
    // elfsightlink.setAttribute('style', 'display:none', 'important')
    elftext.innerHTML = elftext.innerHTML.replace(
      "hello@paulshorey.com",
      '<a href="mailto:hello@paulshorey.com" target="_blank">hello@paulshorey.com</a>'
    );
    elftext.innerHTML = elftext.innerHTML.replace(
      "+1.385.770.6789",
      '<a href="mailto:13857706789" target="_blank">+1.385.770.6789</a>'
    );
  }
}, 2000);

/*
 * Time
 */
window.time1start = performance.now();
window.time1log = function (message) {
  let time = performance.now();
  console.log(((time - window.time1start || 0) / 1000).toFixed(4), message);
  window.time1start = time;
};
