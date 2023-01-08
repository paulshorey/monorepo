import Head from "next/head";
import "typeface-quicksand";

import "antd/dist/antd.css";

import "src/shared/styles/variables.scss";
import "src/shared/styles/reset.scss";
import "src/shared/styles/responsive.scss";
import "src/shared/styles/classes.scss";
import "src/shared/styles/layout.scss";
import "src/shared/styles/antd_overrides.scss";
import "src/shared/styles/ui.scss";
import "src/shared/styles/loading.scss";
import "src/shared/styles/ui_components.scss";

import React, { useEffect } from "react";
import { Provider } from "react-redux";

import store from "src/shared/redux/store";
import { useRouter } from "next/router";
import { analytics_track_page } from "src/functions/analytics";

// The following import prevents a Font Awesome icon server-side rendering bug,
// where the icons flash from a very large icon down to a properly sized one:
import "@fortawesome/fontawesome-svg-core/styles.css";
// Prevent fontawesome from adding its CSS since we did it manually above:
import { config } from "@fortawesome/fontawesome-svg-core";

config.autoAddCss = false; /* eslint-disable import/first */

export default function App({ Component, pageProps }) {
  /*
   * on route change
   */
  let currentName = "";
  const handleRouteChange = (newUrl) => {
    if (newUrl.includes("?")) {
      newUrl = newUrl.substring(0, newUrl.indexOf("?"));
    }
    let newName = newUrl.replace(/[^\w\d]+/g, "-");
    if (newName[0] === "-") newName = newName.substr(1);
    if (newName[newName.length - 1] === "-") newName = newName.substring(0, newName.length - 1);
    if (!newName) newName = "home";
    if (newName === currentName) {
      return;
    }
    currentName = newName;
    /*
     * Track page view
     */
    analytics_track_page({
      name: newName,
    });
  };
  const router = useRouter();
  useEffect(() => {
    // initial page load
    handleRouteChange(router.pathname);
    // subsequent pages
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);
  /*
   * render
   */
  return (
    <Provider store={store}>
      <Head />
      <Component {...pageProps} />
    </Provider>
  );
}
