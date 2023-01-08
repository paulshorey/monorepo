import React from "react";
// import { get as fetcher_get } from 'src/functions/fetcher';
import Sedo from "src/domains/components/PremiumDoms";
// useSwr - https://swr.vercel.app/docs/with-nextjs

const Page = ({ items }) => {
  return (
    <>
      <Sedo items={items} />
    </>
  );
};
export default Page;

export async function getStaticProps() {
  let items = [];
  return {
    props: { items }
  };
}
