import React from "react";
import App from "../src/shared/components/App";
import Word from "src/wordio/containers/Word";
import Footer from "../src/shared/components/Footer";
import Domains from "../src/domains/containers/Home";
const HOST = process.env.NEXT_PUBLIC_HOST;
const WORDIO = HOST === "wordio.co";

class Home extends React.Component {
  /*
   * Render correct page
   */
  render() {
    if (WORDIO) {
      return (
        <App>
          <Word />
        </App>
      );
    } else {
      return (
        <App>
          <Domains />
          <Footer />
        </App>
      );
    }
  }
}

export default Home;

// export const getServerSideProps = async () => {
//   return { redirect: { destination: `/${WORDIO ? "w" : "d"}`, permanent: false } };
// };
// export const getServerSideProps = async (context) => {
//   context.res.writeHead(302, { Location: `/${HOST === "wordio.co" ? "word" : "domains"}` });
//   context.res.end();
//   return {};
// };
