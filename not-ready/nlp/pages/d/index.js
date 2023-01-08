import React from "react";
import App from "src/shared/components/App";
import Domains from "src/domains/containers/Home";
import Footer from "src/shared/components/Footer";

export default RootIndex = () => (
  <App meta_title={"Domain suggestions"}>
    <Domains />
    <Footer />
  </App>
);
