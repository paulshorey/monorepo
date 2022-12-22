import { useEffect } from 'react';
import HomeTemplate from 'components/templates/Home';
import PageContext from 'context/Page';
import { analytics_track_page } from '@ps/fn/browser/analytics';

export default function HomePage() {
  const pageContext = {};
  useEffect(() => {
    analytics_track_page({
      name: 'Home',
      path: '/',
    });
  }, []);
  return (
    <PageContext.Provider value={pageContext}>
      <HomeTemplate />
      <div
        className="elfsight-app-449dc901-7366-43df-b29a-84f77ee0f999"
        style={{ display: 'none' }}
      ></div>
    </PageContext.Provider>
  );
}
